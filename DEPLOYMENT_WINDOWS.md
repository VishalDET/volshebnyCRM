# Deploying to Windows Server (IIS)

Since your API is HTTP-only, hosting the frontend on IIS (Internet Information Services) on a Windows Server allows you to serve the site over HTTP (or configure a proper reverse proxy) to bypass browser "Mixed Content" security blocking.

## Prerequisites

1.  **Windows Server** with **IIS** installed.
2.  **IIS URL Rewrite Module 2.0** installed.
    *   Download: [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
    *   *Crucial: This is required for the application to work (React Routing).*

## Step 1: Build the Application

Run the build command in your local terminal:

```powershell
npm run build
```

This creates a `dist` folder containing:
-   `index.html`
-   `assets/` folder
-   `web.config` (I have just added this for you)

## Step 2: Prepare IIS

1.  Open **IIS Manager** (`inetmgr`).
2.  Right-click **Sites** -> **Add Website**.
3.  **Site name**: `VolshebnyCRM` (or your choice).
4.  **Physical path**: Create a folder, e.g., `C:\inetpub\wwwroot\volshebny-crm`, and select it.
5.  **Binding**:
    *   **Type**: `http`
    *   **Port**: `80` (or `8080` if 80 is taken).
    *   **Host name**: Leave blank or set your domain/IP.

## Step 3: Deploy Files

1.  Copy **ALL** contents from your local `dist` folder.
2.  Paste them into the **Physical path** folder on the server (e.g., `C:\inetpub\wwwroot\volshebny-crm`).

## Step 4: Verify Configuration

1.  Ensure the `web.config` file exists in the server folder.
2.  Try obtaining a URL (e.g., `http://your-server-ip/dashboard`).
    *   If you get a 404, the URL Rewrite Module is likely missing or the `web.config` is ignored.

## Troubleshooting API Issues

If you host this site on `http://`, the browser **WILL** allow requests to your `http://volcrmapi...` API.

**Note:** If you later secure this IIS site with an SSL certificate (`https://`), the "Mixed Content" error will return, and you will be forced to secure the API as well.
