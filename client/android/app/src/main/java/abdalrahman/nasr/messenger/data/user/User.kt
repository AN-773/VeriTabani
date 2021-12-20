package abdalrahman.nasr.messenger.data.user

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
data class User(var id: Long,
                val username: String = "",
                val name: String = "",
                @SerialName(value = "lname")
                val lastName: String = "",
                val email: String? = null,
                var password: String? = null,
                @Transient
                var cookie: String? = null)
