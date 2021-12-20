package abdalrahman.nasr.messenger

import abdalrahman.nasr.messenger.data.rooms.Message
import abdalrahman.nasr.messenger.data.rooms.Room
import abdalrahman.nasr.messenger.data.rooms.RoomsRepo
import abdalrahman.nasr.messenger.data.user.UserRepo
import abdalrahman.nasr.messenger.databinding.ActivityChatBinding
import abdalrahman.nasr.messenger.databinding.MessageViewBinding
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.*
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.viewbinding.ViewBindings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import java.text.SimpleDateFormat
import java.util.*

class ChatActivity : AppCompatActivity() {
    lateinit var binding: ActivityChatBinding;
    lateinit var room: Room
    private val scope = CloseableCoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    lateinit var msgs : MutableList<Message>
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)
        room = Json.decodeFromString(Room.serializer(), intent.getStringExtra("room")!!)
        setSupportActionBar(binding.toolbar)
        title = room.name
        val l = LinearLayoutManager(this)
        l.stackFromEnd = true
        binding.recyclerView.layoutManager = l
        scope.launch {
            binding.loading.visibility = View.VISIBLE
            msgs = RoomsRepo.getMessages(room.id).toMutableList()
            binding.loading.visibility = View.GONE
            binding.recyclerView.adapter = ChatAdapter(msgs)
        }


        binding.sendBtn.setOnClickListener {
            if (binding.msgEditText.text.toString().isBlank()) {
                return@setOnClickListener
            }
            scope.launch {
                binding.loading.visibility = View.VISIBLE
                val msg = Message(
                    roomId = room.id,
                    text = binding.msgEditText.text.toString(),
                    writer = UserRepo.user!!.username,
                    time = System.currentTimeMillis()
                )
                binding.msgEditText.text.clear()
                val id = RoomsRepo.addMessage(msg)
                msg.id = id
                binding.loading.visibility = View.GONE
                ((binding.recyclerView.adapter) as ChatAdapter).messages.add(msg)
                (binding.recyclerView.adapter as ChatAdapter).notifyItemInserted(((binding.recyclerView.adapter) as ChatAdapter).messages.size - 1)
                binding.recyclerView.smoothScrollToPosition(msgs.size-1)
            }
        }
    }
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.room_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.update -> {
                val editText = EditText(this)
                AlertDialog.Builder(this)
                    .setView(editText)
                    .setMessage("Please enter the new name")
                    .setTitle("Room new name")
                    .setPositiveButton("Change"){d, _ ->
                        scope.launch {
                            binding.loading.visibility = View.VISIBLE
                            try {
                                val newName = editText.text.toString()
                                if (newName.isBlank())
                                    return@launch
                                RoomsRepo.updateRoom(room.id, newName)
                                room.name = newName
                                title = room.name
                            }catch (e: Exception) {
                                println(e)
                                Toast.makeText(this@ChatActivity, "Something went wrong", Toast.LENGTH_SHORT).show()
                            }finally {
                                binding.loading.visibility = View.GONE
                            }
                        }
                    }.setNegativeButton("Cancel") {d, _ ->
                        d.dismiss()
                    }.show()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onPause() {
        scope.coroutineContext.cancel()
        super.onPause()
    }

    inner class ChatAdapter(val messages: MutableList<Message>) : RecyclerView.Adapter<ChatAdapter.ChatViewHolder>() {

        inner class ChatViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val binding: MessageViewBinding = MessageViewBinding.bind(itemView)

            fun bind(msg: Message, position: Int) {
                if (msg.replayTo == 0L || msg.replay == null) {
                    binding.replayContainer.visibility = View.GONE
                } else {
                    binding.replayContainer.visibility = View.VISIBLE
                    binding.replatText.text = msg.replay
                }
                binding.writer.text = msg.writer
                binding.msgTxt.text = msg.text
                binding.dateTxt.text = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date(msg.time))
                itemView.setOnLongClickListener {
                    AlertDialog.Builder(itemView.context).setMessage("Are you sure you want to delete the message")
                        .setPositiveButton("Yes") { d, _ ->
                            d.dismiss()
                            scope.launch {
                                this@ChatActivity.binding.loading.visibility = View.VISIBLE
                                RoomsRepo.removeMessage(msg)
                                this@ChatActivity.binding.loading.visibility = View.GONE
                                messages.remove(msg)
                                this@ChatAdapter.notifyItemRemoved(position)
                            }
                        }.setNegativeButton("No") { d, _ -> d.cancel() }.show()
                    true
                }
            }

        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
            return ChatViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.message_view, parent, false))
        }

        override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
            holder.bind(messages[position], position)
        }

        override fun getItemCount(): Int = messages.size

    }
}