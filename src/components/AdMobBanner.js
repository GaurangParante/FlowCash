import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { useTheme } from "../theme/ThemeContext";

const IOS_BANNER_AD_UNIT_ID = "";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: "ca-app-pub-6738123701970067/7034056098",
      ios: IOS_BANNER_AD_UNIT_ID,
    });

const AdMobBanner = () => {
  const { theme } = useTheme();
  const [loadError, setLoadError] = useState(null);
  const styles = useMemo(() => getStyles(theme), [theme]);

  if (!adUnitId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setLoadError(null)}
        onAdFailedToLoad={(error) => {
          console.warn("AdMob banner failed to load", error);
          setLoadError(error?.message || "Ad unavailable");
        }}
      />
      {__DEV__ && loadError ? (
        <Text style={styles.errorText}>{loadError}</Text>
      ) : null}
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 64,
      marginTop: 18,
      marginBottom: 4,
      paddingVertical: 6,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 16,
      overflow: "hidden",
    },
    errorText: {
      color: theme.textMuted,
      fontSize: 11,
      marginTop: 4,
      paddingHorizontal: 12,
      textAlign: "center",
    },
  });

export default AdMobBanner;
