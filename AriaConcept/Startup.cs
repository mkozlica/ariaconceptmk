using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Microsoft.AspNetCore.Mvc;
using AriaConcept.Services;
using AriaConcept.Interfaces;
//using Autodesk.Forge.Core;

namespace AriaConcept
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc(options => options.EnableEndpointRouting = false).AddNewtonsoftJson();
            services.AddSignalR().AddNewtonsoftJsonProtocol(opt =>
            {
                opt.PayloadSerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            });
            services.AddScoped<IForgeAuthService, ForgeAuthService>();
            services.AddScoped<IForgeOSSService, ForgeOSSService>();
            services.AddScoped<IForgeDerivativeService, ForgeDerivativeService>();
            services.AddScoped<IForgeDAService, ForgeDAService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddControllers();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseFileServer();
            app.UseStaticFiles();
            app.UseMvc();
            app.UseRouting();
            app.UseEndpoints(routes =>
            {
                routes.MapControllers();
                routes.MapHub<Controllers.DesignAutomationHub>("/api/signalr/designautomation");
            });
        }
    }
}