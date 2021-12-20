package abdalrahman.nasr.messenger

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.features.json.*
import io.ktor.client.features.json.serializer.*

val httpClient by lazy {
    HttpClient(CIO) {
        install(JsonFeature) {
            serializer = KotlinxSerializer(kotlinx.serialization.json.Json {
                prettyPrint = true
                isLenient = true
            })
        }
    }
}

object Endpoints {
    private const val api = "http://192.168.1.54:3000"
    private const val user_api = "$api/user"
    private const val friends_api = "$api/friends"
    private const val rooms_api = "$api/rooms"

    //User api
    const val USER_LOGIN_API = "$user_api/login"
    const val USER_LOGOUT_API = "$user_api/logout"
    const val USER_REGISTER_API = "$user_api/register"
    const val USER_UPDATE_API = "$user_api/update"
    const val USER_SEARCH_API = "$user_api/search"

    //Friends api
    const val FRIENDS_GET_ALL = "$friends_api/"
    const val FRIENDS_PENDING_REQ = "$friends_api/pending"
    const val FRIENDS_REQUESTS = "$friends_api/requests"
    const val FRIENDS_REQUESTS_ADD = "$friends_api/requests/add"
    const val FRIENDS_REQUESTS_REMOVE = "$friends_api/requests/remove"
    const val FRIENDS_REQUESTS_ACCEPT = "$friends_api/requests/accept"

    //Rooms api
    const val ROOMS_GET_ALL = "$rooms_api/"
    const val ROOMS_CREATE = "$rooms_api/create"
    const val ROOMS_REMOVE = "$rooms_api/remove"
    const val ROOMS_UPDATE = "$rooms_api/update"
    const val ROOMS_ADD_USER = "$rooms_api/add-user"
    const val ROOMS_REMOVE_USER = "$rooms_api/remove-user"
    const val ROOMS_MESSAGES = "$rooms_api/messages"
    const val ROOMS_MESSAGES_SEND = "$rooms_api/messages/send"
    const val ROOMS_MESSAGES_REMOVE = "$rooms_api/messages/remove"
}