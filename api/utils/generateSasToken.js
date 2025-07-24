const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

const logger = require("./logger");

const accountName = process.env.accountName || "stdishadev2";
const accountKey = process.env.accountKey || "";
const containerName = process.env.containerName || "neo-compliance";

async function generateSasToken(blobName, mode, time) {
  try {
    if (!accountName || !accountKey) {
      logger.error(
        "Missing required environment variables: accountName or accountKey"
      );
      throw new Error("Missing Azure Blob Storage credentials");
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + parseInt(time));

    const permissions = BlobSASPermissions.parse(mode);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions,
        expiresOn: expiryDate,
      },
      sharedKeyCredential
    ).toString();

    const sasUrl = `${blobClient.url}?${sasToken}`;

    logger.info("SAS Token URL generated:", sasUrl);
    return sasUrl;
  } catch (error) {
    logger.error("Error creating SAS Token URL:", error.message);
    throw error;
  }
}

module.exports = { generateSasToken };
