import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { useTheme } from "../theme/ThemeContext";

const BANNER_AD_UNIT_ID = "ca-app-pub-6738123701970067/7034056098";

const logAdLoadReason = (placement, error) => {
  if (__DEV__) {
    console.log(
      `${placement} ad not loaded`,
      error?.code || "unknown-code",
      error?.message || "No error message from AdMob"
    );
  }
};

const AdMobBanner = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => logAdLoadReason("Banner", error)}
      />
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
  });

export default AdMobBanner;
