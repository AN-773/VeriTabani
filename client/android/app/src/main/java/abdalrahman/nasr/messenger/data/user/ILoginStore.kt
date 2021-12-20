package abdalrahman.nasr.messenger.data.user

interface ILoginStore {

    fun saveUser(user: User)
    fun getUser(): User?
    fun emptyStore()
}