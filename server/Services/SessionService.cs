// server/Services/SessionService.cs
using System.Collections.Concurrent;

public interface ISessionService
{
    string CreateSession(int userId);
    int? GetUserIdFromSession(string sessionId);
    void RemoveSession(string sessionId);
}

public class SessionService : ISessionService
{
    private readonly ConcurrentDictionary<string, AuthSession> _sessions = new();
    private readonly Timer _cleanupTimer;

    public SessionService()
    {
        // Clean up expired sessions every 30 minutes
        _cleanupTimer = new Timer(CleanupExpiredSessions, null,
            TimeSpan.FromMinutes(30), TimeSpan.FromMinutes(30));
    }

    public string CreateSession(int userId)
    {
        var sessionId = Guid.NewGuid().ToString();
        var session = new AuthSession
        {
            UserId = userId,
            SessionId = sessionId,
            ExpiresAt = DateTime.UtcNow.AddHours(24) // 24 hour sessions
        };

        _sessions[sessionId] = session;
        return sessionId;
    }

    public int? GetUserIdFromSession(string sessionId)
    {
        if (_sessions.TryGetValue(sessionId, out var session))
        {
            if (session.ExpiresAt > DateTime.UtcNow)
            {
                // Extend session on use
                session.ExpiresAt = DateTime.UtcNow.AddHours(24);
                return session.UserId;
            }
            else
            {
                // Remove expired session
                _sessions.TryRemove(sessionId, out _);
            }
        }
        return null;
    }

    public void RemoveSession(string sessionId)
    {
        _sessions.TryRemove(sessionId, out _);
    }

    private void CleanupExpiredSessions(object? state)
    {
        var now = DateTime.UtcNow;
        var expiredSessions = _sessions
            .Where(kvp => kvp.Value.ExpiresAt <= now)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var sessionId in expiredSessions)
        {
            _sessions.TryRemove(sessionId, out _);
        }
    }
}