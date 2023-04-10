using AriaConcept.Interfaces;

using Autodesk.Forge;
using Autodesk.Forge.DesignAutomation;
using Autodesk.Forge.DesignAutomation.Model;
using Autodesk.Forge.Model;

using Newtonsoft.Json.Linq;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Activity = Autodesk.Forge.DesignAutomation.Model.Activity;
using Alias = Autodesk.Forge.DesignAutomation.Model.Alias;
using AppBundle = Autodesk.Forge.DesignAutomation.Model.AppBundle;
using Parameter = Autodesk.Forge.DesignAutomation.Model.Parameter;
using WorkItem = Autodesk.Forge.DesignAutomation.Model.WorkItem;
using WorkItemStatus = Autodesk.Forge.DesignAutomation.Model.WorkItemStatus;

namespace AriaConcept.Services
{
	public class ForgeDAService : IForgeDAService
	{
		// Alias for the app (e.g. DEV, STG, PROD). This value may come from an environment variable
		public string Alias => "dev";
		public string ClientID { get; }
		public string UserName { get; set; } = "";

		private IForgeAuthService _forgeAuthService;
		// Design Automation v3 API
		private DesignAutomationClient _designAutomation;

		public ForgeDAService(IForgeAuthService forgeAuthService, DesignAutomationClient designAutomation)
		{
			_forgeAuthService = forgeAuthService;
			_designAutomation = designAutomation;
			ClientID = _forgeAuthService.ClientID;
		}
		public async Task<List<string>> GetAllEngines()
		{
			//var token = await _forgeService.GetInternalToken();

			List<string> allEngines = new List<string>();
			// define Engines API
			string paginationToken = null;
			while (true)
			{
				Page<string> engines = await _designAutomation.GetEnginesAsync(paginationToken);
				allEngines.AddRange(engines.Data);
				if (engines.PaginationToken == null)
					break;
				paginationToken = engines.PaginationToken;
			}
			allEngines.Sort();
			return allEngines; // return list of engines
		}
		private dynamic EngineAttributes()
		{
			return new
			{
				commandLine = "$(engine.path)\\inventorcoreconsole.exe /al \"$(appbundles[{0}].path)\" /j \"$(args[inputJson].path)\""
			};
		}
		public async Task<AppBundle> CreateAppBundle(string appBundleName, string engineName)
		{
			// get defined app bundles
			Page<string> appBundles = await _designAutomation.GetAppBundlesAsync();

			// check if app bundle is already define
			AppBundle newAppVersion;
			string qualifiedAppBundleId = string.Format("{0}.{1}+{2}", ClientID.ToLower(), appBundleName, Alias);
			if (!appBundles.Data.Contains(qualifiedAppBundleId))
			{
				// create an appbundle (version 1)
				AppBundle appBundleSpec = new AppBundle()
				{
					Package = appBundleName,
					Engine = engineName,
					Id = appBundleName,
					Description = string.Format("Description for {0}", appBundleName)
				};
				newAppVersion = await _designAutomation.CreateAppBundleAsync(appBundleSpec);
				if (newAppVersion == null) throw new Exception("Cannot create new app");

				// create alias pointing to v1
				Alias aliasSpec = new Alias() { Id = Alias, Version = 1 };
				Alias newAlias = await _designAutomation.CreateAppBundleAliasAsync(appBundleName, aliasSpec);
			}
			else
			{
				// create new version
				AppBundle appBundleSpec = new AppBundle()
				{
					Engine = engineName,
					Description = appBundleName
				};
				newAppVersion = await _designAutomation.CreateAppBundleVersionAsync(appBundleName, appBundleSpec);
				if (newAppVersion == null) throw new Exception("Cannot create new version");

				// update alias pointing to v+1
				AliasPatch aliasSpec = new AliasPatch()
				{
					Version = (int)newAppVersion.Version
				};
				Alias newAlias = await _designAutomation.ModifyAppBundleAliasAsync(appBundleName, Alias, aliasSpec);
			}

			return newAppVersion;
		}
		public async Task<string> CreateActivity(string appBundleName, string activityName, string engineName)
		{
			Page<string> activities = await _designAutomation.GetActivitiesAsync();
			string qualifiedActivityId = string.Format("{0}.{1}+{2}", ClientID, activityName, Alias);
			if (!activities.Data.Contains(qualifiedActivityId))
			{
				// define the activity
				// ToDo: parametrize for different engines...
				dynamic engineAttributes = EngineAttributes();
				string commandLine = string.Format(engineAttributes.commandLine, appBundleName);
				Activity activitySpec = new Activity()
				{
					Id = activityName,
					Appbundles = new List<string>() { string.Format("{0}.{1}+{2}", ClientID, appBundleName, Alias) },
					CommandLine = new List<string>() { commandLine },
					Engine = engineName,
					Parameters = new Dictionary<string, Parameter>()
										{
                        //{ "inputFile", new Parameter() { Description = "input file", LocalName = "$(inputFile)", Ondemand = false, Required = true, Verb = Verb.Get, Zip = false } },
                        { "inputJson", new Parameter() { Description = "input json", LocalName = "params.json", Ondemand = false, Required = false, Verb = Verb.Get, Zip = false } },
												{ "outputFile", new Parameter() { Description = "output file", LocalName = "OutputModel" , Ondemand = false, Required = true, Verb = Verb.Put, Zip = true } }
										}
				};
				Activity newActivity = await _designAutomation.CreateActivityAsync(activitySpec);

				// specify the alias for this Activity
				Alias aliasSpec = new Alias() { Id = Alias, Version = 1 };
				Alias newAlias = await _designAutomation.CreateActivityAliasAsync(activityName, aliasSpec);

				return qualifiedActivityId;
			}

			// as this activity points to a AppBundle "dev" alias (which points to the last version of the bundle),
			// there is no need to update it (for this sample), but this may be extended for different contexts
			return "Activity already defined";
		}
		public async Task<List<string>> GetAllActivities()
		{
			// filter list of 
			Page<string> activities = await _designAutomation.GetActivitiesAsync();
			List<string> definedActivities = new List<string>();
			foreach (string activity in activities.Data)
				if (activity.StartsWith(ClientID) && activity.IndexOf("$LATEST") == -1)
					definedActivities.Add(activity.Replace(ClientID + ".", String.Empty));

			return definedActivities;
		}
		private XrefTreeArgument inputFileArgument;
		private XrefTreeArgument inputJsonArgument;
		private XrefTreeArgument outputFileArgument;
		private string browerConnectionId;
		string outputFileNameOSS;
		public async Task<string> StartWorkItem(JObject workItemData)
		{
			string activityName = string.Format("{0}.{1}+{2}", ClientID, workItemData["activityName"].Value<string>(), Alias);
			browerConnectionId = workItemData["browerConnectionId"].Value<string>();
			UserName = workItemData["username"].Value<string>().ToLower();
			string bucketKey = ClientID.ToLower() + "-" + UserName;
			// OAuth token
			var token = await _forgeAuthService.GetInternalToken();
			// 1. input file
			string inputFileNameOSS = workItemData["filename"].Value<string>();
			inputFileArgument = new XrefTreeArgument()
			{
				Verb = Verb.Get,
				PathInZip = "CustomCabinets.iam",
				Url = string.Format("https://developer.api.autodesk.com/oss/v2/buckets/{0}/objects/{1}", bucketKey, inputFileNameOSS),
				Headers = new Dictionary<string, string>()
				{
					{"Authorization", "Bearer " + token.AccessToken }
				}
			};
			// 2. input json
			string inputJson = workItemData["modules"].Value<string>();
			inputJson = inputJson.Replace("\"", "'");
			inputJsonArgument = new XrefTreeArgument()
			{
				Url = "data:application/json, " + inputJson
			};
			// 3. output file
			outputFileNameOSS = GetOutputFileName(activityName); // avoid overriding
			outputFileArgument = new XrefTreeArgument()
			{
				Url = string.Format("https://developer.api.autodesk.com/oss/v2/buckets/{0}/objects/{1}", bucketKey, outputFileNameOSS),
				Verb = Verb.Put,
				Headers = new Dictionary<string, string>()
				{
					{"Authorization", "Bearer " + token.AccessToken }
				}
			};
			// prepare & submit workitem
			WorkItem workItemSpec = CreateWorkItem(activityName);
			WorkItemStatus workItemStatus;
			try
			{
				workItemStatus = await _designAutomation.CreateWorkItemAsync(workItemSpec);
			}
			catch (Exception ex)
			{
				throw;
			}
			return workItemStatus.Id;
		}
		private WorkItem CreateWorkItem(string activityName)
		{
			string webLocation = " http://0228-178-222-215-113.ngrok.io";
			string callbackUrl = string.Format("{0}/api/forge/callback/designautomation?id={1}&outputFileName={2}&userName={3}", webLocation, browerConnectionId, outputFileNameOSS, UserName);
			string progressUrl = string.Format("{0}/api/forge/callback/designautomation?id={1}&outputFileName={2}", webLocation, browerConnectionId, "");

			if (activityName.Contains("PlywoodWork"))
			{
				WorkItem workItemSpec = new WorkItem()
				{
					ActivityId = activityName,
					Arguments = new Dictionary<string, IArgument>()
					{
						{ "inputJson",  inputJsonArgument },
						{ "outputFile", outputFileArgument },
						{ "onComplete", new XrefTreeArgument { Verb = Verb.Post, Url = callbackUrl } },
						{ "onProgress", new XrefTreeArgument{ Verb = Verb.Post, Url = progressUrl} }
					}
				};
				return workItemSpec;
			}
			else if (activityName.Contains("ColorizeCabinets"))
			{
				WorkItem workItemSpec = new WorkItem()
				{
					ActivityId = activityName,
					Arguments = new Dictionary<string, IArgument>()
					{
						{ "inputFile",  inputFileArgument },
						{ "inputJson",  inputJsonArgument },
						{ "outputFile", outputFileArgument },
						{ "onComplete", new XrefTreeArgument { Verb = Verb.Post, Url = callbackUrl } },
						{ "onProgress", new XrefTreeArgument{ Verb = Verb.Post, Url = progressUrl} }
					}
				};
				return workItemSpec;
			}
			else
			{
				WorkItem workItemSpec = new WorkItem()
				{
					ActivityId = activityName,
					Arguments = new Dictionary<string, IArgument>()
					{
						{ "inputFile",  inputFileArgument },
                        { "inputJson",  inputJsonArgument },
                        { "outputFile", outputFileArgument },
						{ "onComplete", new XrefTreeArgument { Verb = Verb.Post, Url = callbackUrl } },
						{ "onProgress", new XrefTreeArgument{ Verb = Verb.Post, Url = progressUrl} }
					}
				};
				return workItemSpec;
			}
		}
		private string GetOutputFileName(string activityName)
		{
			if (activityName.Contains("PlywoodWork"))
			{
				return string.Format("{0}_output_{1}", DateTime.Now.ToString("yyyyMMddhhmmss"), "Modules.zip");
			}
			else if (activityName.Contains("ColorizeCabinets"))
			{
				return "CustomCabinets" + DateTime.Now.ToString("yyyyMMddhhmmss") + ".zip";
			}
			return string.Format("{0}_output_{1}", DateTime.Now.ToString("yyyyMMddhhmmss"), "Drawings.pdf");
		}
		public async Task<dynamic> CreateSignedResource(string bucketKey, string outputFileName)
		{
			var token = await _forgeAuthService.GetInternalToken();
			var objectsApi = new ObjectsApi();
			objectsApi.Configuration.AccessToken = token.AccessToken;
			dynamic signedUrl = await objectsApi.CreateSignedResourceAsyncWithHttpInfo(bucketKey, outputFileName, new PostBucketsSigned(10), "read");
			return signedUrl;
		}
		private static string GetAppSetting(string settingKey)
		{
			return Environment.GetEnvironmentVariable(settingKey);
		}
	}
}
