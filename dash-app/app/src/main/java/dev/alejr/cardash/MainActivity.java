package dev.alejr.cardash;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebMessage;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;

import com.spotify.protocol.client.Subscription;
import com.spotify.protocol.types.Image;
import com.spotify.protocol.types.PlayerState;
import com.spotify.protocol.types.Track;

import java.io.ByteArrayOutputStream;


public class MainActivity extends AppCompatActivity {

    private  WebView webView = null;
    private  WebViewInterface webViewInterface = null;

    private static final String CLIENT_ID = "cfe7f24fa02c4c0c8f475aced8a2ea48";
    private static final String REDIRECT_URI = "https://red-and-me.alejr.dev/";
    private SpotifyAppRemote mSpotifyAppRemote;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        this.webView = (WebView) findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();

        webSettings.setJavaScriptEnabled(true);

        webView.setWebChromeClient(new WebChromeClient());
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setJavaScriptEnabled(true);
        webSettings.setPluginState(WebSettings.PluginState.ON);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);


        webView.setWebViewClient(new WebViewClientWithIntents(this));
        //webView.loadUrl("http://192.168.15.28:3000/index.html");
        webView.loadUrl("file:///android_asset/dash.html");
        webView.setWebContentsDebuggingEnabled(true);

        this.webViewInterface = new WebViewInterface(this);
        webView.addJavascriptInterface(this.webViewInterface,"Android");
    }

    @Override
    protected void onResume(){
        super.onResume();
        ConnectionParams connectionParams = new ConnectionParams.Builder((CLIENT_ID))
                .setRedirectUri(REDIRECT_URI)
                .showAuthView(true)
                .build();

        SpotifyAppRemote.connect(this,connectionParams, new Connector.ConnectionListener(){
            public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                mSpotifyAppRemote = spotifyAppRemote;
                webViewInterface.attachSpotify(mSpotifyAppRemote);

                // Now you can start interacting with App Remote
                connected();

            }

            public void onFailure(Throwable throwable) {
                Log.e("MyActivity", throwable.getMessage(), throwable);

                // Something went wrong when attempting to connect! Handle errors here
            }
        });
    }

    private void postMessage (String tag,String message) {
        WebMessage webMessage = new WebMessage(tag+"|"+message);
        webView.postWebMessage(webMessage, Uri.parse("*"));
    }

    private void connected(){
        // Subscribe to PlayerState
        mSpotifyAppRemote.getPlayerApi()
                .subscribeToPlayerState()
                .setEventCallback(playerState -> {

                    this.postMessage("isPaused",playerState.isPaused? "true": "false");
                    this.postMessage("playbackPosition",Long.toString(playerState.playbackPosition));

                    final Track track = playerState.track;
                    if (track != null) {


                        mSpotifyAppRemote.getImagesApi().getImage(track.imageUri, Image.Dimension.THUMBNAIL).setResultCallback(image->{
                            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                            image.compress(Bitmap.CompressFormat.PNG,100,byteArrayOutputStream);
                            byte[] bytearray = byteArrayOutputStream.toByteArray();
                            String imageBase64 = Base64.encodeToString(bytearray,Base64.DEFAULT);
                            String imageString = "data:image/png;base64," + imageBase64;
                            this.postMessage("trackCover",imageString);
                        });
                        this.postMessage("trackName",track.name);
                        this.postMessage("trackArtist",track.artist.name);
                    }
                    else{
                        this.postMessage("trackName","");
                        this.postMessage("trackArtist","");
                        this.postMessage("trackCover","");
                    }

                });
    }
    @Override
    protected void onStop() {
        super.onStop();
        SpotifyAppRemote.disconnect(mSpotifyAppRemote);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && this.webView.canGoBack()) {
            this.webView.goBack();
            return true;
        }

        return super.onKeyDown(keyCode, event);
    }
}