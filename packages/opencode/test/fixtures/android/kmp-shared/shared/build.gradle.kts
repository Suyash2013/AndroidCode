plugins {
    kotlin("multiplatform")
    id("com.android.library")
}
kotlin {
    androidTarget()
    iosX64(); iosArm64()
    sourceSets {
        val commonMain by getting {}
        val androidMain by getting {}
        val iosMain by getting {}
    }
}
