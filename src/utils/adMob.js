import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  default as mobileAds,
  useInterstitialAd,
  useRewardedAd,
} from "react-native-google-mobile-ads";

const REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: true,
};

const EXPENSES_INTERSTITIAL_AD_UNIT_ID = Platform.select({
  android: "ca-app-pub-6738123701970067/3004145891",
  ios: "",
});

const CATEGORIES_REWARDED_AD_UNIT_ID = Platform.select({
  android: "ca-app-pub-6738123701970067/5840175720",
  ios: "",
});

let mobileAdsReadyPromise = null;

const logAdLoadReason = (placement, error) => {
  if (__DEV__) {
    console.log(
      `${placement} ad not loaded`,
      error?.code || "unknown-code",
      error?.message || "No error message from AdMob"
    );
  }
};

const ensureMobileAdsReady = () => {
  if (!mobileAdsReadyPromise) {
    mobileAdsReadyPromise = mobileAds().initialize();
  }

  return mobileAdsReadyPromise;
};

const useShowAdOnFocus = ({ placement, isLoaded, isShowing, load, show, error }) => {
  const shouldShowRef = useRef(false);
  const hasShownThisFocusRef = useRef(false);
  const isLoadedRef = useRef(isLoaded);
  const isShowingRef = useRef(isShowing);
  const loadAd = useCallback(async () => {
    try {
      await ensureMobileAdsReady();
      if (
        shouldShowRef.current &&
        !isLoadedRef.current &&
        !isShowingRef.current
      ) {
        load();
      }
    } catch {
      // Keep navigation usable if the SDK is temporarily unavailable.
    }
  }, [load]);

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  useEffect(() => {
    isShowingRef.current = isShowing;
  }, [isShowing]);

  useEffect(() => {
    if (error) {
      logAdLoadReason(placement, error);
    }
  }, [error, placement]);

  useFocusEffect(
    useCallback(() => {
      shouldShowRef.current = true;
      hasShownThisFocusRef.current = false;

      if (!isLoadedRef.current && !isShowingRef.current) {
        loadAd();
      }

      return () => {
        shouldShowRef.current = false;
      };
    }, [loadAd])
  );

  useEffect(() => {
    if (
      shouldShowRef.current &&
      !hasShownThisFocusRef.current &&
      isLoaded &&
      !isShowing
    ) {
      hasShownThisFocusRef.current = true;
      try {
        show();
      } catch {
        // Ignore transient show failures and leave the screen usable.
      }
    }
  }, [isLoaded, isShowing, show]);
};

export const useExpensesInterstitialAd = () => {
  const ad = useInterstitialAd(
    EXPENSES_INTERSTITIAL_AD_UNIT_ID || null,
    REQUEST_OPTIONS
  );

  useShowAdOnFocus({ placement: "Expenses interstitial", ...ad });
};

export const useCategoriesRewardedAd = () => {
  const ad = useRewardedAd(
    CATEGORIES_REWARDED_AD_UNIT_ID || null,
    REQUEST_OPTIONS
  );

  useShowAdOnFocus({ placement: "Categories rewarded", ...ad });
};
