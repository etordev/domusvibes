namespace DomusVibes.Domain.Entities
{
    public class HomePulse
    {
        public Guid Id { get; set; }
        public Guid HomeId { get; set; }
        public DateOnly Day { get; set; }
        public int Score { get; set; }
        public int MoodScore { get; set; }
        public int EnergyScore { get; set; }
        public int CompletedScore { get; set; }
        public int MissedScore { get; set; }
        public int CommunicationScore { get; set; }
        public bool LowMood { get; set; }
        public DateTimeOffset CalculatedAt { get; set; }
    }
}
