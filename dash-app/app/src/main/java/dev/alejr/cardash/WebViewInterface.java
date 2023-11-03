package dev.alejr.cardash;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.ParcelUuid;
import android.util.Log;
import android.webkit.JavascriptInterface;

import androidx.core.app.ActivityCompat;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.UUID;

import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;

import com.spotify.protocol.client.Subscription;
import com.spotify.protocol.types.PlayerState;
import com.spotify.protocol.types.Track;

public class WebViewInterface {
    private static String[] PERMISSIONS_LOCATION = {
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_LOCATION_EXTRA_COMMANDS,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_PRIVILEGED
    };
    Context mContext;
    SpotifyAppRemote mSpotifyAppRemote;

    WebViewInterface(Context c) {
        mContext = c;
    }

    public void attachSpotify(SpotifyAppRemote spotifyAppRemote){
        this.mSpotifyAppRemote = spotifyAppRemote;
    }


    @JavascriptInterface
    public void resumeMusic(){
        mSpotifyAppRemote.getPlayerApi().resume();
    }

    @JavascriptInterface
    public void pauseMusic(){
        mSpotifyAppRemote.getPlayerApi().pause();
    }

    @JavascriptInterface
    public void previousMusic(){
        mSpotifyAppRemote.getPlayerApi().skipPrevious();
    }

    @JavascriptInterface
    public void nextMusic(){
        mSpotifyAppRemote.getPlayerApi().skipNext();
    }


}
