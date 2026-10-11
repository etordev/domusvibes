using DomusVibes.Domain.Entities;
using DomusVibes.Domain.Tasks;

namespace DomusVibes.Application.Homes.Queries.GetHomeDashboard
{
    public static class HouseholdInsight
    {
        public static List<ShareItemDto> Shares(
            IReadOnlyList<HomeMember> members,
            IReadOnlyList<ActivityEvent> recent,
            DateOnly today)
        {
            var from = today.AddDays(-13);
            var points = recent
                .Where(activity => activity.Completed && activity.OccurredOn >= from && activity.OccurredOn <= today)
                .GroupBy(activity => activity.UserId)
                .ToDictionary(group => group.Key, group => group.Sum(activity => activity.Weight < 1 ? 1 : activity.Weight));

            var total = points.Values.Sum();
            return members.Select(member =>
            {
                var earned = points.GetValueOrDefault(member.UserId);
                return new ShareItemDto
                {
                    UserId = member.UserId,
                    Name = member.User.Name,
                    Points = earned,
                    Percent = total == 0 ? 0 : (int)Math.Round(earned * 100.0 / total)
                };
            }).OrderByDescending(share => share.Points).ToList();
        }

        public static SuggestionDto Suggest(Guid userId, IReadOnlyList<ShareItemDto> shares, IReadOnlyList<ActivityEvent> recent, DateOnly today)
        {
            var from = today.AddDays(-13);
            var doneKeys = recent
                .Where(activity => activity.Completed && activity.UserId == userId && activity.OccurredOn >= from)
                .Select(activity => activity.TaskKey ?? activity.Type)
                .ToHashSet();

            var mine = shares.FirstOrDefault(share => share.UserId == userId);
            var yours = mine?.Percent ?? 0;
            var totalPoints = shares.Sum(share => share.Points);
            if (totalPoints == 0)
            {
                return new SuggestionDto
                {
                    Kind = "empty",
                    Yours = 0,
                    TaskKeys = ["dishes", "trash", "tidying"]
                };
            }

            var even = shares.Count == 0 ? 100 : (int)Math.Round(100.0 / shares.Count);
            var ahead = shares
                .Where(share => share.UserId != userId)
                .OrderByDescending(share => share.Percent)
                .FirstOrDefault();

            if (yours + 15 >= even)
            {
                return new SuggestionDto { Kind = "even", Yours = yours, TaskKeys = [] };
            }

            var ideas = HouseholdTasks.All
                .OrderByDescending(task => task.Stars)
                .ThenBy(task => task.Minutes)
                .Select(task => task.Key)
                .Where(key => !doneKeys.Contains(key))
                .Take(3)
                .ToList();
            if (ideas.Count == 0)
                ideas = HouseholdTasks.All.OrderBy(task => task.Minutes).Take(3).Select(task => task.Key).ToList();

            return new SuggestionDto
            {
                Kind = "behind",
                Yours = yours,
                OtherName = ahead?.Name,
                Theirs = ahead?.Percent ?? 0,
                TaskKeys = ideas
            };
        }

        public static (TurnItemDto Item, string Notice) NextTurn(
            HomeTurn turn,
            DateOnly today,
            IReadOnlyDictionary<Guid, string> names)
        {
            var people = turn.Members.OrderBy(member => member.SortOrder).ToList();
            var interval = Math.Max(1, turn.IntervalDays);
            int index;
            DateOnly due;
            if (today <= turn.StartsOn)
            {
                due = turn.StartsOn;
                index = 0;
            }
            else
            {
                var elapsed = today.DayNumber - turn.StartsOn.DayNumber;
                index = elapsed / interval;
                due = turn.StartsOn.AddDays(index * interval);
                if (due < today)
                {
                    index++;
                    due = turn.StartsOn.AddDays(index * interval);
                }
            }

            var assignee = people[index % people.Count];
            var days = due.DayNumber - today.DayNumber;
            var name = names.GetValueOrDefault(assignee.UserId) ?? "";
            var item = new TurnItemDto
            {
                Id = turn.Id,
                TaskKey = turn.TaskKey,
                IntervalDays = interval,
                AlertDays = turn.AlertDays,
                DueOn = due,
                DaysUntil = days,
                UserId = assignee.UserId,
                UserName = name
            };
            return (item, $"turn|{turn.TaskKey}|{due:yyyy-MM-dd}|{name}|{days}");
        }
    }
}
