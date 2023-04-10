using Autodesk.Forge;
using Autodesk.Forge.Model;

using AriaConcept.Services;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

using Newtonsoft.Json.Linq;

using RestSharp;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using AppBundle = Autodesk.Forge.DesignAutomation.Model.AppBundle;
using static AriaConcept.Services.ForgeDerivativeService;
using AriaConcept.Interfaces;

namespace AriaConcept.Controllers
{
	[ApiController]
	public class DesignAutomationController : ControllerBase
	{
		// Used to access the application folder (temp location for files & bundles)
		private IWebHostEnvironment _env;
		// used to access the SignalR Hub
		private IHubContext<DesignAutomationHub> _hubContext;
		// Prefix for AppBundles and Activities
		public string NickName => _forgeDAService.ClientID.ToLower();
		public string LocalBundlesFolder { get { return Path.Combine(_env.WebRootPath, "bundles"); } }

		// Design Automation v3 API
		private IForgeDAService _forgeDAService;

		// Constructor, where env and hubContext are specified
		public DesignAutomationController(IWebHostEnvironment env, IHubContext<DesignAutomationHub> hubContext, IForgeDAService api)
		{
			_forgeDAService = api;
			_env = env;
			_hubContext = hubContext;
		}
		/// <summary>
		/// Names of app bundles on this project
		/// </summary>
		[HttpGet]
		[Route("api/appbundles")]
		public string[] GetLocalBundles()
		{
			// this folder is placed under the public folder, which may expose the bundles
			// but it was defined this way so it be published on most hosts easily
			return Directory.GetFiles(LocalBundlesFolder, "*.zip").Select(Path.GetFileNameWithoutExtension).ToArray();
		}
		/// <summary>
		/// Return a list of available engines
		/// </summary>
		[HttpGet]
		[Route("api/forge/designautomation/engines")]
		public async Task<List<string>> GetAvailableEngines()
		{
			return await _forgeDAService.GetAllEngines();
		}
		/// <summary>
		/// Define a new appbundle
		/// </summary>
		[HttpPost]
		[Route("api/forge/designautomation/appbundles")]
		public async Task<IActionResult> CreateAppBundle([FromBody] JObject appBundleSpecs)
		{
			// basic input validation
			string zipFileName = appBundleSpecs["zipFileName"].Value<string>();
			string engineName = appBundleSpecs["engine"].Value<string>();

			// standard name for this sample
			string appBundleName = appBundleSpecs["bundleName"].Value<string>();// "PlywoodWorkPlugin";

			// check if ZIP with bundle is here
			string packageZipPath = Path.Combine(LocalBundlesFolder, zipFileName + ".zip");
			if (!System.IO.File.Exists(packageZipPath)) throw new Exception("Appbundle not found at " + packageZipPath);

			AppBundle newAppVersion = await _forgeDAService.CreateAppBundle(appBundleName, engineName);

			// upload the zip with .bundle
			RestClient uploadClient = new RestClient(newAppVersion.UploadParameters.EndpointURL);
			RestRequest request = new RestRequest(string.Empty, Method.Post);
			request.AlwaysMultipartFormData = true;
			foreach (KeyValuePair<string, string> x in newAppVersion.UploadParameters.FormData) request.AddParameter(x.Key, x.Value);
			request.AddFile("file", packageZipPath);
			request.AddHeader("Cache-Control", "no-cache");
			await uploadClient.ExecuteAsync(request);

			return Ok(new { AppBundle = newAppVersion.Id, Version = newAppVersion.Version });
		}
		/// <summary>
		/// Define a new activity
		/// </summary>
		[HttpPost]
		[Route("api/forge/designautomation/activities")]
		public async Task<IActionResult> CreateActivity([FromBody] JObject activitySpecs)
		{
			// basic input validation
			string bundleName = activitySpecs["bundleName"].Value<string>();
			string activityName = activitySpecs["activityName"].Value<string>();
			string engineName = activitySpecs["engine"].Value<string>();

			string activityMessage = await _forgeDAService.CreateActivity(bundleName, activityName, engineName);

			return Ok(new { Activity = activityMessage });
		}
		/// <summary>
		/// Get all Activities defined for this account
		/// </summary>
		[HttpGet]
		[Route("api/forge/designautomation/activities")]
		public async Task<List<string>> GetDefinedActivities()
		{
			return await _forgeDAService.GetAllActivities();
		}
		/// <summary>
		/// Start a new workitem
		/// </summary>
		[HttpPost]
		[Route("api/forge/designautomation/workitems")]
		public async Task<IActionResult> PrepareWorkitem([FromForm] StartWorkitemInput input)
		{
			// basic input validation
			JObject workItemData = JObject.Parse(input.data);
			string workItemId = await _forgeDAService.StartWorkItem(workItemData);
			return Ok(new { WorkItemId = workItemId });
		}
		/// <summary>
		/// Input for StartWorkitem
		/// </summary>
		public class StartWorkitemInput
		{
			public IFormFile inputFile { get; set; }
			public string data { get; set; }
		}
		/// <summary>
		/// Callback from Design Automation Workitem (onProgress or onComplete)
		/// </summary>
		[HttpPost]
		[Route("/api/forge/callback/designautomation")]
		public async Task<IActionResult> OnCallback(string id, string outputFileName, string userName, [FromBody] dynamic body)
		{
			if (string.IsNullOrWhiteSpace(outputFileName)) outputFileName = string.Empty;
			try
			{
				if (outputFileName.Contains(".pdf"))
				{
					//JObject bodyJson = JObject.Parse((string)body.ToString());
					//var client = new RestClient(bodyJson["reportUrl"].Value<string>());
					//var request = new RestRequest(string.Empty);

					//byte[] bs = client.DownloadData(request);
					//string report = System.Text.Encoding.Default.GetString(bs);
					//await _hubContext.Clients.Client(id).SendAsync("onComplete", report);

					dynamic signedUrl = await _forgeDAService.CreateSignedResource(NickName + "-" + userName, outputFileName);
					await _hubContext.Clients.Client(id).SendAsync("downloadResult", (string)signedUrl.Data.signedUrl);
				}
				else
				{
					// your webhook should return immediately! we can use Hangfire to schedule a job
					JObject bodyJson = JObject.Parse((string)body.ToString());
					if (bodyJson.ContainsKey("progress"))
					{
						await _hubContext.Clients.Client(id).SendAsync("onProgress", bodyJson.ToString());
					}
					else if (bodyJson.ContainsKey("reportUrl"))
					{
						await _hubContext.Clients.Client(id).SendAsync("onComplete", bodyJson.ToString(), outputFileName);
						string urn = "urn:adsk.objects:os.object:" + NickName + "-" + userName + "/" + outputFileName;
						await _hubContext.Clients.Client(id).SendAsync("translateModel", Base64Encode(urn));
					}
				}
			}
			catch (Exception) { }

			// ALWAYS return ok (200)
			return Ok();
		}
	}
	/// <summary>
	/// Class uses for SignalR
	/// </summary>
	public class DesignAutomationHub : Microsoft.AspNetCore.SignalR.Hub
	{
		public string GetConnectionId() { return Context.ConnectionId; }
	}

}
