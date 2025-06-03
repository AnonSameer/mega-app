// server/Extensions/AuthExtensions.cs
public static class AuthExtensions
{
    public static int? GetCurrentUserId(this HttpContext context, ISessionService sessionService)
    {
        var sessionId = context.Request.Cookies["session"];
        if (string.IsNullOrEmpty(sessionId))
        {
            return null;
        }

        return sessionService.GetUserIdFromSession(sessionId);
    }
}