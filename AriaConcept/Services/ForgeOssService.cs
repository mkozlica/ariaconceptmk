using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

using Autodesk.Forge;
using Autodesk.Forge.Client;
using Autodesk.Forge.Model;

using AriaConcept.Controllers;
using AriaConcept.Interfaces;

using Microsoft.Extensions.Configuration;

using static AriaConcept.Controllers.OSSController;

namespace AriaConcept.Services
{
	public class ForgeOSSService : IForgeOSSService
	{
		private IForgeAuthService _forgeAuthService;
		private string _clientId;
		private string _bucketKey;
		private string _bucketRegion;
		public ForgeOSSService(IForgeAuthService forgeAuthService, IConfiguration configuration)
		{
			_forgeAuthService = forgeAuthService;
			_clientId = configuration.GetSection("FORGE_CLIENT_ID").Value;
			_bucketKey = configuration.GetSection("FORGE_BUCKET").Value;
			_bucketRegion = configuration.GetSection("FORGE_BUCKET_REGION").Value;
		}
		public async Task EnsureBucketExists(string bucketKey)
		{
			var token = await _forgeAuthService.GetInternalToken();
			var bucketsApi = new BucketsApi();
			bucketsApi.Configuration.AccessToken = token.AccessToken;
			try
			{
				await bucketsApi.GetBucketDetailsAsync(bucketKey);
				_bucketKey = bucketKey;

			}
			catch (ApiException e)
			{
				if (e.ErrorCode == 404)
				{
					await bucketsApi.CreateBucketAsync(new PostBucketsPayload(bucketKey, null, PostBucketsPayload.PolicyKeyEnum.Persistent), _bucketRegion);
					_bucketKey = bucketKey;
				}
				else
				{
					throw e;
				}
			}
		}
		public async Task<ObjectDetails> UploadModel(string objectName, Stream content, long contentLength)
		{
			await EnsureBucketExists(_bucketKey);
			var token = await _forgeAuthService.GetInternalToken();
			var objectsApi = new ObjectsApi();
			objectsApi.Configuration.AccessToken = token.AccessToken;
			var obj = (await objectsApi.UploadObjectAsync(_bucketKey, objectName, (int)contentLength, content)).ToObject<ObjectDetails>();
			return obj;
		}
		public async Task<IEnumerable<ObjectDetails>> GetObjects()
		{
			const int PageSize = 64;
			await EnsureBucketExists(_bucketKey);
			var token = await _forgeAuthService.GetInternalToken();
			var objectsApi = new ObjectsApi();
			objectsApi.Configuration.AccessToken = token.AccessToken;
			var results = new List<ObjectDetails>();
			var response = (await objectsApi.GetObjectsAsync(_bucketKey, PageSize)).ToObject<BucketObjects>();
			results.AddRange(response.Items);
			while (!string.IsNullOrEmpty(response.Next))
			{
				var queryParams = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(new Uri(response.Next).Query);
				response = (await objectsApi.GetObjectsAsync(_bucketKey, PageSize, null, queryParams["startAt"])).ToObject<BucketObjects>();
				results.AddRange(response.Items);
			}
			return results;
		}
		public async Task<IList<TreeNode>> GetAllBuckets(string id)
		{
			IList<TreeNode> nodes = new List<TreeNode>();
			var token = await _forgeAuthService.GetInternalToken();

			if (id == "#") // root
			{
				// in this case, let's return all buckets
				BucketsApi bucketsApi = new BucketsApi();
				bucketsApi.Configuration.AccessToken = token.AccessToken;

				// to simplify, let's return only the first 100 buckets
				dynamic buckets = await bucketsApi.GetBucketsAsync(_bucketRegion, 100);
				foreach (KeyValuePair<string, dynamic> bucket in new DynamicDictionaryItems(buckets.items))
				{
					nodes.Add(new TreeNode(bucket.Value.bucketKey, bucket.Value.bucketKey.Replace(_clientId + "-", string.Empty), "bucket", true));
				}
			}
			else
			{
				// as we have the id (bucketKey), let's return all 
				ObjectsApi objects = new ObjectsApi();
				objects.Configuration.AccessToken = token.AccessToken;
				var objectsList = await objects.GetObjectsAsync(id, 100);
				foreach (KeyValuePair<string, dynamic> objInfo in new DynamicDictionaryItems(objectsList.items))
				{
					nodes.Add(new TreeNode(Base64Encode((string)objInfo.Value.objectId),
						objInfo.Value.objectKey, "object", false));
				}
			}
			return nodes;
		}
	}
}
