package abdalrahman.nasr.messenger

import abdalrahman.nasr.messenger.databinding.ActivityLoginBinding
import abdalrahman.nasr.messenger.data.user.LoginStoreImpl
import abdalrahman.nasr.messenger.data.user.User
import abdalrahman.nasr.messenger.data.user.UserRepo
import android.content.Intent
import android.os.Bundle
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*
import kotlin.Exception

class LoginActivity : AppCompatActivity() {

    lateinit var binding: ActivityLoginBinding
    private val scope = CloseableCoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        scope.launch {
            UserRepo.logout()
        }
        binding.login.setOnClickListener {
            val email = binding.email.text.toString()
            val password = binding.password.text.toString()
            if (email.isBlank() || password.isBlank()) {
                Toast.makeText(this, "Please enter E-Mail and/or Password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            scope.launch {
                try {
                    binding.loading.visibility = View.VISIBLE
                    UserRepo.login(email, password, LoginStoreImpl(this@LoginActivity))
                    binding.loading.visibility = View.GONE
                    Log.i("MainActivity", (Thread.currentThread().id == Looper.getMainLooper().thread.id).toString())
                    val i = Intent(this@LoginActivity, MainActivity::class.java)
                    startActivity(i)
                    finish()
                } catch (e: Exception) {
                    println(e)
                    Toast.makeText(this@LoginActivity, "Something went wrong", Toast.LENGTH_SHORT).show()
                    binding.loading.visibility = View.GONE
                }
            }

        }

        binding.register.setOnClickListener {
            val email = binding.email.text.toString()
            val password = binding.password.text.toString()
            val name = binding.name.text.toString()
            val lname = binding.lname.text.toString()
            val username = binding.username.text.toString()
            if (email.isBlank() || password.isBlank() || name.isBlank() || lname.isBlank() || username.isBlank()) {
                Toast.makeText(this, "Please enter all information", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            scope.launch {
                try {
                    UserRepo.register(User(0, username, name, lname, email, password), LoginStoreImpl(this@LoginActivity))
                    withContext(Dispatchers.Main) {
                        val i = Intent(this@LoginActivity, MainActivity::class.java)
                        startActivity(i)
                        finish()
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        println(e)
                        Toast.makeText(this@LoginActivity, "Something went wrong", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    override fun onPause() {
        scope.coroutineContext.cancel()
        super.onPause()
    }


}