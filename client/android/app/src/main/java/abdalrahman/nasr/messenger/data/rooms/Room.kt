package abdalrahman.nasr.messenger.data.rooms

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Room(var id: String = "", var name: String = "",
                @SerialName(value = "last_active_time")
                var lastActiveTime: Long = System.currentTimeMillis(), var owner: Long = 0)
