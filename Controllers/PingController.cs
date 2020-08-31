using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace SimulacionE2EE.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PingController : ControllerBase
    {
        private readonly ILogger<PingController> _logger;

        public PingController(ILogger<PingController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public string Get()
        {
            _logger.LogDebug("Ping => Get()");
            return "pong";
        }
    }
}
