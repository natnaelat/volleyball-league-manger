import mysql.connector
from mysql.connector import Error
import tkinter as tk
from tkinter import messagebox

try:
    connection = mysql.connector.connect(
        host='localhost',
        database='TournamentDB',
        user='root',
        password='Bearnww360!'
    )

    if connection.is_connected():
        root = tk.Tk()
        root.withdraw()
        messagebox.showinfo("Connection Status",
                            "Connected: Python_Connect_To_MySQL_Database")
        print("Connected: Python_Connect_To_MySQL_Database")

except Error as e:
    # Show an error popup if connection fails
    root = tk.Tk()
    root.withdraw()
    messagebox.showerror("Connection Error",
                         f"❌ Error while connecting to MySQL:\n{e}")
    print("Error while connecting to MySQL", e)

finally:
    if 'connection' in locals() and connection.is_connected():
        connection.close()
