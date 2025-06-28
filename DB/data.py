import sqlite3
import bcrypt

class UserData:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(UserData, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.db = sqlite3.connect('Data.db', check_same_thread=False)
        self.cur = self.db.cursor()
        self._create_users_table()
        self._create_feed_back_table()
        self._initialized = True

    def _create_users_table(self):
        try:
            self.cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL
                )
            ''')
            self.db.commit()
            return True
        except Exception:
            return False

    def _create_feed_back_table(self):
        try:
            self.cur.execute('''
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fd TEXT
                )
            ''')
            self.db.commit()
            return True
        except:
            return False

    def _hash_password(self, password):
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def _check_password(self, password, hashed):
        return bcrypt.checkpw(password.encode(), hashed.encode())

    def insert_user(self, email, password):
        try:
            hashed_pw = self._hash_password(password)
            self.cur.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_pw))
            self.db.commit()
            return True
        except sqlite3.IntegrityError:
            return False

    def login(self, email, password):
        self.cur.execute("SELECT password FROM users WHERE email = ?", (email,))
        row = self.cur.fetchone()
        if row and self._check_password(password, row[0]):
            return True
        return False

    def insert_fd(self, fd):
        try:
            self.cur.execute("INSERT INTO feedback (fd) VALUES (?)", (fd,))
            self.db.commit()
            return True
        except Exception:
            return False

    def get_user(self, email):
        self.cur.execute("SELECT email, password FROM users WHERE email = ?", (email,))
        return self.cur.fetchone()

    def get_all_users(self):
        self.cur.execute("SELECT * FROM users")
        return self.cur.fetchall()

    def get_all_feedback(self):
        self.cur.execute("SELECT * FROM feedback")
        return self.cur.fetchall()

    def update_password_by_email(self, email, new_password):
        try:
            new_hashed_pw = self._hash_password(new_password)
            self.cur.execute("UPDATE users SET password = ? WHERE email = ?", (new_hashed_pw, email))
            self.db.commit()
            return True
        except Exception:
            return False

    def delete_all_feedback(self):
        try:
            self.cur.execute("DELETE FROM feedback")
            self.db.commit()
            return True
        except Exception:
            return False

    def delete_user_by_email(self, email):
        try:
            self.cur.execute("DELETE FROM users WHERE email = ?", (email,))
            self.db.commit()
            return True
        except Exception:
            return False

    def delete_all_users(self):
        try:
            self.cur.execute("DELETE FROM users")
            self.db.commit()
            return True
        except Exception:
            return False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        
    def __del__(self):
        self.close()
        
        
    def close(self):
        try:
            self.db.close()
            return True
        except Exception:
            return False
