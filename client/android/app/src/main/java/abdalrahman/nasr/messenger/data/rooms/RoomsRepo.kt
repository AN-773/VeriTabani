package abdalrahman.nasr.messenger.data.rooms

import abdalrahman.nasr.messenger.Endpoints
import abdalrahman.nasr.messenger.data.user.User
import abdalrahman.nasr.messenger.data.user.UserRepo
import abdalrahman.nasr.messenger.httpClient
import android.util.Log
import io.ktor.client.request.*
import io.ktor.http.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

object RoomsRepo {

    suspend fun getRooms(): List<Room> = withContext(Dispatchers.IO) {
        httpClient.get(Endpoints.ROOMS_GET_ALL) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
        }
    }

    suspend fun createRoom(room: Room): String = withContext(Dispatchers.IO) {
        httpClient.post<Room>(Endpoints.ROOMS_CREATE) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            Log.d("Rooms", UserRepo.user!!.cookie!!)
            contentType(ContentType.Application.Json)
            body = room
        }.id
    }

    suspend fun updateRoom(id: String, newName: String) = withContext(Dispatchers.IO) {
        httpClient.post<Any>(Endpoints.ROOMS_UPDATE) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            contentType(ContentType.Application.Json)
            body = Room(id, newName)
        }
    }

    suspend fun deleteRoom(id: String) = withContext(Dispatchers.IO) {
        httpClient.post<Any>(Endpoints.ROOMS_REMOVE) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            contentType(ContentType.Application.Json)
            body = Room(id, "")
        }
    }

    @Serializable
    private data class UsersRoom(val id: String, val users: List<User>)

    suspend fun addUserToRoom(id: String, users: List<User>) = withContext(Dispatchers.IO) {
        httpClient.post<Any>(Endpoints.ROOMS_ADD_USER) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            contentType(ContentType.Application.Json)
            body = UsersRoom(id, users)
        }
    }

    suspend fun removeUsersFromRoom(id: String, users: List<User>) = withContext(Dispatchers.IO) {
        httpClient.post<Any>(Endpoints.ROOMS_REMOVE_USER) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            contentType(ContentType.Application.Json)
            body = UsersRoom(id, users)
        }
    }

    @Serializable
    private class MessageReq(val id: String, val start: Int, val size: Int)

    suspend fun getMessages(id: String): List<Message> = withContext(Dispatchers.IO) {
        httpClient.get(Endpoints.ROOMS_MESSAGES) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            contentType(ContentType.Application.Json)
            body = MessageReq(id, 0, 999999)
        }
    }

    suspend fun removeMessage(msg: Message) = withContext(Dispatchers.IO) {
        httpClient.post<Any>(Endpoints.ROOMS_MESSAGES_REMOVE) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            contentType(ContentType.Application.Json)
            body = msg
        }
    }

    suspend fun addMessage(msg: Message) : Long = withContext(Dispatchers.IO) {
        httpClient.post<Message>(Endpoints.ROOMS_MESSAGES_SEND) {
            headers[HttpHeaders.Cookie] = UserRepo.user?.cookie ?: throw IllegalStateException("User not logged in")
            contentType(ContentType.Application.Json)
            body = msg
        }.id
    }
}