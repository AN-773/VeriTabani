package abdalrahman.nasr.messenger

import abdalrahman.nasr.messenger.data.user.UserRepo
import kotlinx.coroutines.runBlocking
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        runBlocking {
//            println(Json.encodeToString(LoginInfo.serializer(), LoginInfo("a@a.a","987654321")))
            UserRepo.login("a@a.a", "987654321", null)
//            UserRepo.register(User(0, "axa1", "ahmed1", "saleh1", "ahsa@a1.a", "852852"))
//            println(UserRepo.search("sa"))
//            println(RoomsRepo.getRooms())
//            println(RoomsRepo.createRoom("Family"))
//            println(RoomsRepo.updateRoom("UKEiPKlA7Y-L", "MyFamily"))
//            RoomsRepo.deleteRoom("UKEiPKlA7Y-L")
//            RoomsRepo.addUserToRoom("zaQeYTXEORvp", listOf(User(1), User(2), User(3), User(4), User(5)))
//            RoomsRepo.removeUsersFromRoom("zaQeYTXEORvp", listOf(User(1)))
//            println(RoomsRepo.getMessages("zaQeYTXEORvp"))
        }
    }
}