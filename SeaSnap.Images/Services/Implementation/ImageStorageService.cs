using System.Security.Cryptography;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using SeaSnap.Images.Services.Interfaces;

namespace SeaSnap.Images.Services.Implementation;

public class ImageStorageService : IImageStorageService
{
    private readonly IConfiguration _config;
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;
    private readonly string _s3Url;

    public ImageStorageService(IConfiguration config)
    {
        _config = config;
        _bucketName = config["Seaweed:Bucket"];
        var accessKey = config["Seaweed:accessKey"];
        var secretKey = config["Seaweed:secretKey"];
        _s3Url = config["Seaweed:S3Url"]; 

        Amazon.AWSConfigsS3.UseSignatureVersion4 = true;

        var s3Config = new AmazonS3Config
        {
            ServiceURL = _s3Url,
            AuthenticationRegion = "us-east-1",
            ForcePathStyle = true
        };


        _s3 = new AmazonS3Client(accessKey, secretKey, s3Config);

        Amazon.AWSConfigs.LoggingConfig.LogTo = LoggingOptions.SystemDiagnostics;
        Amazon.AWSConfigs.LoggingConfig.LogResponses = ResponseLoggingOption.Always;
    }

    private async Task<bool> BucketExistsAsync(string bucketName)
    {
        try
        {
            var request = new ListObjectsV2Request
            {
                BucketName = bucketName,
                MaxKeys = 1
            };
            var response = await _s3.ListObjectsV2Async(request);
            return true;
        }
        catch (AmazonS3Exception ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.NotFound || ex.ErrorCode == "NoSuchBucket")
                return false;
            throw;
        }
    }

    private async Task CreateBucketIfNotExistsAsync(string bucketName)
    {
        try
        {
            await BucketExistsAsync(bucketName);
        }
        catch (Exception ex)
        {
            var putBucketRequest = new PutBucketRequest
            {
                BucketName = bucketName
            };
            await _s3.PutBucketAsync(putBucketRequest);  
        }
    }

    public async Task<string> UploadAsync(IFormFile file, string fileName)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Invalid file.");

        await CreateBucketIfNotExistsAsync(_bucketName);


        string base64Md5 = null;
        byte[] fileBytes = null;
        using (var ms = new MemoryStream())
        {
            await file.CopyToAsync(ms);
            fileBytes = ms.ToArray();
            using (var md5 = MD5.Create())
            {
                var hashBytes = md5.ComputeHash(fileBytes);
                base64Md5 = Convert.ToBase64String(hashBytes);
                Console.WriteLine($"Client-side MD5: {base64Md5}, File Size: {fileBytes.Length} bytes");
            }
        }

        using var uploadStream = new MemoryStream(fileBytes);
        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName,
            InputStream = uploadStream,
            ContentType = GetContentType(file.FileName),
            UseChunkEncoding = false,
            MD5Digest = base64Md5 
        };

        try
        {
            var response = await _s3.PutObjectAsync(putRequest);
            if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
                throw new Exception($"Upload failed with status code: {response.HttpStatusCode}");
        }
        catch (AmazonS3Exception ex)
        {
            Console.WriteLine($"S3 Error: {ex.Message}, ErrorCode: {ex.ErrorCode}, StatusCode: {ex.StatusCode}");
            throw;
        }
        

        return $"{_s3Url}/{_bucketName}/{fileName}";
    }

    // Set ContentType based on file extension
    private string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }

    public async Task<Stream> GetAsync(string key)
    {
        var response = await _s3.GetObjectAsync(_bucketName, key);
        return response.ResponseStream;
    }

    public async Task<bool> DeleteAsync(string key)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };
        var response = await _s3.DeleteObjectAsync(deleteRequest);
        return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
    }

    public string GetPreSignedUrl(string key, TimeSpan? ttl = null)
    {
        var urlRequest = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.Add(ttl ?? TimeSpan.FromMinutes(120)),
            Verb = HttpVerb.GET
        };
        return _s3.GetPreSignedURL(urlRequest);
    }

    public async Task<IReadOnlyList<string>> ListAllAsync(string? prefix = null)
    {
        var keys = new List<string>();
        string? token = null;
        do
        {
            var listRequest = new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = prefix,
                ContinuationToken = token
            };
            var listResponse = await _s3.ListObjectsV2Async(listRequest);
            keys.AddRange(listResponse.S3Objects.Select(o => o.Key));
            token = listResponse.IsTruncated ? listResponse.NextContinuationToken : null;
        } while (token is not null);
        return keys;
    }
}