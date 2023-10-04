package dev.alejr.cardash;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class WebViewClientWithIntents extends WebViewClient {
    private Activity activity = null;

    public WebViewClientWithIntents(Activity activity){
        this.activity = activity;
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView webView, WebResourceRequest request){
        Log.i("SCHEME:",request.getUrl().getScheme());
        Log.i("PATH:",request.getUrl().getPath());
        Log.i("HOST:","'"+request.getUrl().getHost()+"'");

        if(request.getUrl().getHost().equals("192.168.15.28:3000")){
            return false;
        }
        else if(request.getUrl().getScheme().equals("app")){
            Intent appIntent = null;
            String packageName = request.getUrl().getHost();
            if(packageName.equals("settings")){
                Log.i("PATH",request.getUrl().getPath());
                switch(request.getUrl().getPath()){
                    case "/apps":
                        appIntent = new Intent(Settings.ACTION_APP_SEARCH_SETTINGS);
                        break;
                    default:
                        appIntent = new Intent(Settings.ACTION_SETTINGS);
                        break;
                }
                appIntent = new Intent(Settings.ACTION_SETTINGS);
            }
            else{
                appIntent = activity.getPackageManager().getLaunchIntentForPackage(request.getUrl().getHost());
            }
            if(appIntent != null) {
                activity.startActivity(appIntent);
            }
            return  true;
        }
        else{
            Intent intent = new Intent(Intent.ACTION_VIEW, request.getUrl());
            activity.startActivity(intent);
            return  true;
        }
    }
}
