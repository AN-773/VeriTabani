package abdalrahman.nasr.messenger.data.rooms

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Message(
    var id: Long = 0L,
    var writer: String = "",
    var text: String = "",
    var replay: String? = "",
    @SerialName(value = "replay_to")
    var replayTo: Long? = 0L,
    var time: Long = 0L,
    var roomId: String = ""
)
