package abdalrahman.nasr.messenger

import abdalrahman.nasr.messenger.data.user.LoginStoreImpl
import abdalrahman.nasr.messenger.data.user.UserRepo
import android.app.Application

class MyApplication: Application() {

    override fun onCreate() {
        super.onCreate()
        UserRepo.init(LoginStoreImpl(this))
    }
}