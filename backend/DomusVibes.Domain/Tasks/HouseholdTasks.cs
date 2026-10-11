namespace DomusVibes.Domain.Tasks
{
    public static class HouseholdTasks
    {
        public sealed record TaskItem(string Key, string Group, int Stars, int Minutes);

        public static readonly IReadOnlyList<TaskItem> All =
        [
            new("bathroom", "cleaning", 5, 40),
            new("kitchenclean", "cleaning", 4, 30),
            new("floors", "cleaning", 3, 25),
            new("dishes", "kitchen", 2, 15),
            new("cooking", "kitchen", 3, 40),
            new("trash", "trash", 1, 5),
            new("shopping", "shopping", 3, 45),
            new("tidying", "tidying", 2, 20)
        ];

        public static TaskItem? Find(string? key) =>
            All.FirstOrDefault(task => task.Key == key);
    }
}
