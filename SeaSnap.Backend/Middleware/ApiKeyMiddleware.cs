namespace SeaSnap.Backend.Middleware;

public class ApiKeyMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        var key = context.Request.Headers["X-API-KEY"];
        if (key != "your-secret-key")
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized");
            return;
        }
        await next(context);
    }
}