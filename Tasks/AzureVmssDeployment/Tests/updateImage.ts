import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'main.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tr.setInput("action", "Update image");
tr.setInput("ConnectedServiceName", "AzureRM");
tr.setInput("vmssName", process.env["noMatchingVmss"] === "true" ? "random-vmss" : (process.env["_vmssOsType_"] === "Linux" ? "testvmss2" : "testvmss1"));
tr.setInput("imageUrl", process.env["imageUrlAlreadyUptoDate"] === "true" ? "http://old-url" : "https://someurl");
if(!(process.env["customScriptNotSpecified"] === "true")) {
    tr.setInput("customScriptsPath", "C:\\some\\dir");
    tr.setInput("customScriptCommand", process.env["_vmssOsType_"] === "Linux" ? "./file.sh args" : "powershell .\\file.ps1 args");
    tr.setInput("customScriptsStorageAccount", "teststorage1");
}

process.env["AZURE_HTTP_USER_AGENT"] = "L0test";
process.env["ENDPOINT_AUTH_AzureRM"] = "{\"parameters\":{\"serviceprincipalid\":\"id\",\"serviceprincipalkey\":\"key\",\"tenantid\":\"tenant\"},\"scheme\":\"ServicePrincipal\"}";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRM_SERVICEPRINCIPALID"] = "id";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRM_SERVICEPRINCIPALKEY"] = "key";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRM_TENANTID"] = "tenant";
process.env["ENDPOINT_DATA_AzureRM_SUBSCRIPTIONID"] = "sId";
process.env["ENDPOINT_DATA_AzureRM_SUBSCRIPTIONNAME"] = "sName";
process.env["ENDPOINT_URL_AzureRM"] = "https://management.azure.com/";
process.env["ENDPOINT_DATA_AzureRM_ENVIRONMENTAUTHORITYURL"] = "https://login.windows.net/";
process.env["ENDPOINT_DATA_AzureRM_ACTIVEDIRECTORYSERVICEENDPOINTRESOURCEID"] = "https://login.windows.net/";
process.env["RELEASE_RELEASEID"] = "100";
process.env["RELEASE_ATTEMPTNUMBER"] = "5";

let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "findMatch": {
        "**/*.*": [
            "C:\\users\\temp\\vstsvmss12345\\folder1\\file1",
            "C:\\users\\temp\\vstsvmss12345\\folder1\\folder2\\file2",
        ]
    },
    "osType": {
        "osType": "Windows_NT"
    }
};

process.env["MOCK_NORMALIZE_SLASHES"] = "true";
tr.setAnswers(a);

var os = require('os');
os.tmpdir = function tmpdir() {
    return "C:\\users\\temp";
}

Date.now = function(): number {
    return 12345;
}

tr.registerMock('vsts-task-lib/toolrunner', require('vsts-task-lib/mock-toolrunner'));
tr.registerMock('azure-arm-rest/azure-arm-compute', require('./mock_node_modules/azure-arm-compute'));
tr.registerMock('azure-arm-rest/azure-arm-storage', require('./mock_node_modules/azure-arm-storage'));
tr.registerMock('../blobservice', require('./mock_node_modules/blobservice'));
tr.registerMock('utility-common/compressutility', require('./mock_node_modules/compressutility'));

tr.run();