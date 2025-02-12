import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

function UnityComponent() {
    const { unityProvider } = useUnityContext({
      loaderUrl: "/src/assets/UnityBuild/Build/UnityBuild.loader.js",
      dataUrl: "/src/assets/UnityBuild/Build/UnityBuild.data",
      frameworkUrl: "/src/assets/UnityBuild/Build/UnityBuild.framework.js",
      codeUrl: "/src/assets/UnityBuild/Build/UnityBuild.wasm",
    });
  
    return <Unity unityProvider={unityProvider} />;
    // Later gotta make this match the size of the screen
  }

export default UnityComponent