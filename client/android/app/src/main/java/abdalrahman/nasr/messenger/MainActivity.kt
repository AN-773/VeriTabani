package abdalrahman.nasr.messenger

import abdalrahman.nasr.messenger.data.rooms.Room
import abdalrahman.nasr.messenger.data.rooms.RoomsRepo
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.ui.AppBarConfiguration
import abdalrahman.nasr.messenger.databinding.ActivityMainBinding
import abdalrahman.nasr.messenger.data.user.UserRepo
import android.annotation.SuppressLint
import android.content.Intent
import android.view.*
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json

class MainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    private var scope = CloseableCoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    lateinit var rooms: MutableList<Room>

    @SuppressLint("NotifyDataSetChanged")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!UserRepo.isLoggedIn()) {
            val i = Intent(this, LoginActivity::class.java)
            startActivity(i)
            finish()
            return
        }
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.fab.setOnClickListener {
            val editText = EditText(this)
            AlertDialog.Builder(this)
                .setMessage("Please Enter Room Name: ")
                .setTitle("New Room")
                .setView(editText)
                .setPositiveButton("Create") { d, _ ->
                    if (editText.text.toString().isNotBlank()) {
                        scope.launch {
                            val room = Room(name = editText.text.toString())
                            val id = RoomsRepo.createRoom(room)
                            room.id = id
                            room.owner = UserRepo.user!!.id
                            rooms.add(0, room)
                            binding.recyclerView.adapter?.notifyDataSetChanged()
                            d.dismiss()
                        }
                    }
                }
                .setNegativeButton("Cancel") { d, _ ->
                    d.dismiss()
                }.show()
        }

    }

    @SuppressLint("NotifyDataSetChanged")
    override fun onResume() {
        super.onResume()
        scope = CloseableCoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
        scope.launch {
            binding.loading.visibility = View.VISIBLE
            rooms = RoomsRepo.getRooms().toMutableList()
            binding.loading.visibility = View.GONE
            binding.recyclerView.adapter = RoomsAdapter()
        }
    }

    override fun onPause() {
        scope.coroutineContext.cancel()
        super.onPause()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.logout -> {
                val i = Intent(this, LoginActivity::class.java)
                startActivity(i)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private inner class RoomsAdapter() :
        RecyclerView.Adapter<RoomsAdapter.RoomViewHolder>() {

        inner class RoomViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            @SuppressLint("NotifyDataSetChanged")
            fun bind(room: Room) {
                itemView.findViewById<TextView>(R.id.title).text = room.name
                itemView.setOnClickListener {
                    val i = Intent(itemView.context, ChatActivity::class.java)
                    i.putExtra("room", Json.encodeToString(Room.serializer(), room))
//                    Toast.makeText(itemView.context, room.name, Toast.LENGTH_SHORT).show()
                    itemView.context.startActivity(i)
                }
                itemView.setOnLongClickListener {
                    AlertDialog.Builder(itemView.context).setMessage("Are you sure you want to delete ${room.name}")
                        .setPositiveButton("Yes") { d, _ ->
                            d.dismiss()
                            scope.launch {
                                binding.loading.visibility = View.VISIBLE
                                RoomsRepo.deleteRoom(room.id)
                                binding.loading.visibility = View.GONE
                                rooms.remove(room)
                                this@RoomsAdapter.notifyDataSetChanged()
                            }
                        }.setNegativeButton("No") { d, _ -> d.cancel() }.show()
                    true
                }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RoomViewHolder {
            return RoomViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.room_view, parent, false))
        }

        override fun onBindViewHolder(holder: RoomViewHolder, position: Int) {
            holder.bind(rooms[position])
        }

        override fun getItemCount(): Int = rooms.size
    }
}