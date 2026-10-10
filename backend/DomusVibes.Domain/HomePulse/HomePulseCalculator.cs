namespace DomusVibes.Domain.HomePulse
{
    public record HomePulseResult(
        int Score,
        int MoodScore,
        int EnergyScore,
        int CompletedScore,
        int MissedScore,
        int CommunicationScore,
        bool LowMood);

    /// <summary>
    /// One rule for the 0–100 house score.
    /// Mood 30%, energy 20%, completed chores 25%, missed chores 15%, comments 10%.
    /// Low energy versus a medium day moves the total by -10.
    /// Each finished chore adds 5 until that share is full.
    /// Each missed chore subtracts about 7 until that share is empty.
    /// A comment on an event counts as positive feedback.
    /// </summary>
    public static class HomePulseCalculator
    {
        public static HomePulseResult Calculate(
            IReadOnlyList<string> moods,
            IReadOnlyList<string> energies,
            int completedCount,
            int missedCount,
            int positiveNotes)
        {
            var moodScore = Average(moods.Select(MoodPoints), 60);
            var energyScore = Average(energies.Select(EnergyPoints), 60);
            var completedScore = Math.Clamp(50 + completedCount * 20, 0, 100);
            var missedScore = Math.Clamp(100 - missedCount * 47, 0, 100);
            var communicationScore = Math.Clamp(50 + positiveNotes * 25, 0, 100);

            var raw =
                0.30 * moodScore +
                0.20 * energyScore +
                0.25 * completedScore +
                0.15 * missedScore +
                0.10 * communicationScore;

            var score = (int)Math.Clamp(Math.Round(raw), 0, 100);
            var lowMood = moods.Count > 0 && moodScore <= 40;

            return new HomePulseResult(
                score,
                moodScore,
                energyScore,
                completedScore,
                missedScore,
                communicationScore,
                lowMood);
        }

        public static int MoodPoints(string mood) => mood switch
        {
            "happy" => 100,
            "stressed" => 20,
            _ => 60
        };

        public static int EnergyPoints(string energy) => energy switch
        {
            "high" => 100,
            "low" => 10,
            _ => 60
        };

        private static int Average(IEnumerable<int> values, int fallback)
        {
            var list = values.ToList();
            if (list.Count == 0)
                return fallback;

            return (int)Math.Round(list.Average());
        }
    }
}
