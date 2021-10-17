using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MSFSTouchPanel.Shared;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MSFSTouchPanel.TouchPanelHost
{
    public class WebHost : IWebHost
    {
        private IHost _host;
        private ISimConnectService _simConnectService;

        public WebHost(IntPtr windowHandle)
        {
            _simConnectService = new SimConnectService(windowHandle);
        }

        public IServiceProvider Services
        {
            get { return _host.Services; }
        }

        public void Dispose()
        {
            _host.Dispose();
        }

        public async Task StartAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                _host = CreateHostBuilder().Build();
                _simConnectService.SetMemoryCache(_host.Services.GetService<IMemoryCache>());
                await _host.StartAsync();
            }
            catch (Exception ex)
            {
                Logger.ServerLog($"Host server start error: : {ex.Message}", LogLevel.ERROR);
            }
        }

        public async Task StopAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                await _host.StopAsync();
            }
            catch (Exception ex)
            {
                Logger.ServerLog($"Host server stop error: : {ex.Message}", LogLevel.ERROR);
            }
        }

        public async Task RestartAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                await StopAsync();
                _host.Dispose();
                Thread.Sleep(2000);
                await StartAsync();
            }
            catch (Exception ex)
            {
                Logger.ServerLog($"Host server restart error: : {ex.Message}", LogLevel.ERROR);
            }
        }
        private IHostBuilder CreateHostBuilder() =>
            Host.CreateDefaultBuilder()
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder
                .UseKestrel()
                //.UseShutdownTimeout(TimeSpan.FromSeconds(10))
                .SuppressStatusMessages(true)
                .ConfigureServices((hostContext, services) =>
                {
                    services.Configure<ConsoleLifetimeOptions>(opts => opts.SuppressStatusMessages = true);
                    services.AddControllersWithViews();
                    services.AddMemoryCache();
                    services.AddHostedService<WebHostService>();
                    services.AddSingleton<ISimConnectService>(provider => _simConnectService);

                    // In production, the React files will be served from this directory
                    services.AddSpaStaticFiles(configuration =>
                    {
                        configuration.RootPath = "reactclient";
                    });

                    // Allow CORS for API access, this are for REACTJS PWA APP with security cert
                    services.AddCors();

                    //services.AddCors(options =>
                    //{
                    //    options.AddPolicy(name: MY_ALLOW_SPECIFIC_ORIGINS,
                    //                      builder =>
                    //                      {
                    //                          builder.WithOrigins("http://localhost",
                    //                                              "http://localhost:5000",
                    //                                              "https://msfstouchpanel.ddns.net/",
                    //                                              "http://msfstouchpanel.ddns.net/").AllowAnyMethod().AllowAnyHeader();
                    //                      });
                    //});
                })
                .Configure((app) =>
                {
                    var env = app.ApplicationServices.GetService<IWebHostEnvironment>();

                    app.UseExceptionHandler("/Error");
                    //app.UseHsts();      // use HTTPS to allow client side webservice worker  

                    //app.UseCors(MY_ALLOW_SPECIFIC_ORIGINS);

                    app.UseCors(builder => builder
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .SetIsOriginAllowed((host) => true)
                        .AllowCredentials()
                    );

                    app.UseStaticFiles();
                    app.UseSpaStaticFiles();

                    app.UseRouting();

                    app.UseEndpoints(endpoints =>
                    {
                        endpoints.MapControllerRoute(
                            name: "default",
                            pattern: "{controller}/{action=Index}/{id?}");
                    });

                    app.UseSpa(spa =>
                    {
                        spa.Options.SourcePath = env.ContentRootPath + @"\..\reactclient";

                        if (env.IsDevelopment())
                        {
                            spa.UseReactDevelopmentServer(npmScript: "start");
                        }
                    });
                });
            })
            .UseConsoleLifetime();
    }

    public interface IWebHost : IHost
    {
        Task RestartAsync(CancellationToken cancellationToken = default);
    }
}
