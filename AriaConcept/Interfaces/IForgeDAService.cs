using Autodesk.Forge.DesignAutomation.Model;

using Newtonsoft.Json.Linq;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace AriaConcept.Services
{
	public interface IForgeDAService
	{
		string Alias { get; }
		string ClientID { get; }
		string UserName { get; set; }
		Task<string> CreateActivity(string appBundleName, string activityName, string engineName);
		Task<AppBundle> CreateAppBundle(string appBundleName, string engineName);
		Task<List<string>> GetAllActivities();
		Task<List<string>> GetAllEngines();
		Task<string> StartWorkItem(JObject workItemData);
		Task<dynamic> CreateSignedResource(string nickName, string outputFileName);
	}
}