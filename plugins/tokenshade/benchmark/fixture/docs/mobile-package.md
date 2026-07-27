# Mobile package

The mobile build embeds `bootstrap.zip` in the application package. The ZIP
contains the initial `data`, `adapters`, and `src` directories needed to render
the sign-in screen before a network catalog is selected.

The build uses Java 17, Android NDK 29, and CMake 3.22.1. Release artifacts are
created with:

```text
./gradlew assembleRelease
```

`bootstrap.zip` is copied into `app/src/main/assets/` before Gradle runs. At
first launch the platform bootstrapper copies those files to the application's
writable data directory.

The optional native archive extension is disabled on mobile because it is not
available on every ABI. The package guide does not define how a downloaded
catalog ZIP is extracted after first launch, how its manifest is verified, or
how it becomes the active version under `data/catalog/<version>/`.

Successful packaging proves only that the bootstrap files are inside the APK.
Runtime catalog installation is owned by the application layer.
