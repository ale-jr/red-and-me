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

    WebViewInterface(Context c) {
        mContext = c;
    }

    @JavascriptInterface
    public boolean isWifiConnected() {
        ConnectivityManager connectivityManager = (ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);

        Network network = connectivityManager.getActiveNetwork();

        if (network == null) return false;

        NetworkCapabilities capabilities = connectivityManager.getNetworkCapabilities(network);
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED);

    }

    public Activity getActivity(Context context) {
        if (context == null) {
            return null;
        } else if (context instanceof ContextWrapper) {
            if (context instanceof Activity) {
                return (Activity) context;
            } else {
                return getActivity(((ContextWrapper) context).getBaseContext());
            }
        }

        return null;
    }

    private void checkPermissions() {
        int permission = ActivityCompat.checkSelfPermission(mContext, Manifest.permission.BLUETOOTH_SCAN);
        if (permission != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    getActivity(mContext),
                    PERMISSIONS_LOCATION,
                    1
            );
        }
    }


    @JavascriptInterface
    public boolean isSoundPaired() {
        try {
            BluetoothManager bluetoothManager = (BluetoothManager) mContext.getSystemService(Context.BLUETOOTH_SERVICE);
            BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();
            if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();

            if (pairedDevices.size() > 0) {
                // There are paired devices. Get the name and address of each paired device.
                for (BluetoothDevice device : pairedDevices) {
                    String deviceName = device.getName();
                    String deviceHardwareAddress = device.getAddress(); // MAC address
                    Log.i("BT", deviceName + " add:" + deviceHardwareAddress);

                    if (deviceHardwareAddress.equals("41:42:F5:21:25:4C")) {
                        Method m = device.getClass().getMethod("isConnected", (Class[]) null);
                        boolean connected = (boolean) m.invoke(device, (Object[]) null);
                        if (connected) {
                            return true;
                        }
                        else {
                            tryToConnectSound(device,bluetoothAdapter);
                            return false;
                        }


                    }
                }
            }
            return false;
        } catch (Exception ex) {
            Log.e("isSoundPaired", "error", ex);

            return false;
        }

    }


    @JavascriptInterface
    public void tryToConnectSound(BluetoothDevice device, BluetoothAdapter adapter) {
        try {
            new Thread(() -> {
                try {
                    if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                        return;
                    }
                    ParcelUuid[] uuids = device.getUuids();
                    BluetoothSocket socket = device.createRfcommSocketToServiceRecord(uuids[0].getUuid());
                    checkPermissions();
                    adapter.cancelDiscovery();

                    try{
                        socket.connect();
                        Log.i("BT","request connection");
                    }
                    catch (Exception e){
                        socket.close();
                        Log.i("BT","socket exception",e);
                    }
                }
                catch (Exception ex){
                    Log.i("BT","thread run error");
                }
            }).start();
        }
        catch(Exception ex){
            Log.e("BT","tryToConnectSound",ex);
        }
    }
}
