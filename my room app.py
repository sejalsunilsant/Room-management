import tkinter as tk
from tkinter import messagebox, ttk
import ttkbootstrap as ttk
from ttkbootstrap.constants import *
import json
import os
from PIL import Image, ImageTk
from tabulate import tabulate

def show_logo():
    """Display a window with a logo temporarily."""
    root.title("Room Management System")
    root.configure(bg="#f0f0f0")

    try:
        # Load the logo using Pillow
        image = Image.open("logo.png")  # Replace with your logo file path
        image = image.resize((300, 300))  # Resize the logo as needed
        logo = ImageTk.PhotoImage(image)

        # Display the logo
        ttk.Label(root, image=logo, bootstyle="light").pack(pady=20)
        ttk.Label(root, text="Room Management System", font=("Arial", 24, "bold"), bootstyle="info").pack()

        # Transition to main dashboard after 3 seconds
        root.after(3000, setup_dashboard)

        # Keep the reference to the logo to prevent garbage collection
        root.logo = logo
    except Exception as e:
        messagebox.showerror("Error", f"Failed to load logo: {e}")

def create_button(parent, text, command, row, column):
    """Create buttons with hover effect."""
    button = ttk.Button(
        parent,
        text=text,
        command=command,
        bootstyle="info-outline",
        width=20
    )
    button.grid(row=row, column=column, padx=10, pady=10)
    return button

def setup_dashboard():
    """Set up the main dashboard."""
    for widget in root.winfo_children():
        widget.destroy()

    root.title("Room Management System Dashboard")
    root.configure(bg="#f0f0f0")

    frame = ttk.Frame(root, bootstyle="light")
    frame.pack(expand=True, fill="both", padx=20, pady=20)

    ttk.Label(frame, text="Room Management System Dashboard", font=("Arial", 20, "bold"), bootstyle="info").grid(row=0, column=0, columnspan=3, pady=20)

    # Add buttons for functionalities
    buttons = [
        ("Show Rent Information", show_rent_info, 1, 0),
        ("Check Room Availability", show_vacant_rooms, 1, 1),
        ("Add New Room", add_new_room, 1, 2),
        ("Light Bill", light_bill_menu, 2, 0),
        ("Update Room Information", update_room, 2, 1),
        ("Show Room Table", show_room_table, 2, 2),
        ("Set Reminder", set_reminder, 3, 0),
        ("Exit", root.quit, 3, 2),
    ]

    for text, command, row, col in buttons:
        create_button(frame, text, command, row, col)

def show_room_table():
    """Display all room information in a tabular format."""
    rooms = load_rooms()
    table_window = tk.Toplevel(root)
    table_window.title("Room Information")
    table_window.geometry("800x400")

    columns = ("Room ID", "Holder Name", "Rent", "Light Units", "Occupied")
    tree = ttk.Treeview(table_window, columns=columns, show="headings", bootstyle="info")
    tree.pack(fill="both", expand=True)

    for col in columns:
        tree.heading(col, text=col)
        tree.column(col, anchor="center", width=100)

    for room in rooms:
        tree.insert("", "end", values=(
            room["room_id"], 
            room["holder_name"], 
            room["rent"], 
            room["light_units"], 
            "Yes" if room["occupied"] else "No"
        ))

    scrollbar = ttk.Scrollbar(table_window, orient="vertical", command=tree.yview)
    tree.configure(yscroll=scrollbar.set)
    scrollbar.pack(side="right", fill="y")

    # Print table to console
    table_data = [[room["room_id"], room["holder_name"], room["rent"], room["light_units"], "Yes" if room["occupied"] else "No"] for room in rooms]
    print(tabulate(table_data, headers=columns, tablefmt="grid"))

def show_rent_info():
    rooms = load_rooms()
    if not rooms:
        messagebox.showinfo("Rent Info", "No rooms available.")
        return

    info = "\n".join(
        f"Room {room['room_id']} ({room['holder_name']}): Rent = ₹{room['rent']} | Status = {'Occupied' if room['occupied'] else 'Vacant'}"
        for room in rooms
    )
    messagebox.showinfo("Rent Information", info)

def show_vacant_rooms():
    rooms = load_rooms()
    vacant_rooms = [room for room in rooms if not room["occupied"]]
    if vacant_rooms:
        info = "\n".join(f"Room {room['room_id']} is vacant." for room in vacant_rooms)
    else:
        info = "No vacant rooms available."
    messagebox.showinfo("Vacant Rooms", info)

def add_new_room():
    def submit_new_room():
        try:
            room_id = int(entry_room_id.get())
            holder_name = entry_holder_name.get()
            rent = int(entry_rent.get())
            occupied = var_occupied.get() == "Occupied"
        except ValueError:
            messagebox.showerror("Error", "Invalid input! Room ID and rent must be numbers.")
            return

        rooms = load_rooms()
        if any(room["room_id"] == room_id for room in rooms):
            messagebox.showerror("Error", f"Room ID {room_id} already exists!")
            return

        new_room = {"room_id": room_id, "holder_name": holder_name, "rent": rent, "occupied": occupied, "light_units": 0}
        rooms.append(new_room)
        save_rooms(rooms)
        messagebox.showinfo("Success", f"Room {room_id} added successfully!")
        add_window.destroy()

    add_window = ttk.Toplevel(root)
    add_window.title("Add New Room")
    add_window.geometry("400x300")
    
    ttk.Label(add_window, text="Enter Room ID:").pack(pady=5)
    entry_room_id = ttk.Entry(add_window)
    entry_room_id.pack(pady=5)
    
    ttk.Label(add_window, text="Enter Holder Name:").pack(pady=5)
    entry_holder_name = ttk.Entry(add_window)
    entry_holder_name.pack(pady=5)
    
    ttk.Label(add_window, text="Enter Rent:").pack(pady=5)
    entry_rent = ttk.Entry(add_window)
    entry_rent.pack(pady=5)
    
    ttk.Label(add_window, text="Occupied (select one):").pack(pady=5)
    var_occupied = ttk.StringVar(value="Occupied")
    ttk.Radiobutton(add_window, text="Occupied", variable=var_occupied, value="Occupied").pack()
    ttk.Radiobutton(add_window, text="Vacant", variable=var_occupied, value="Vacant").pack()
    
    ttk.Button(add_window, text="Submit", command=submit_new_room, bootstyle="info").pack(pady=10)

def light_bill_menu():
    light_bill_window = ttk.Toplevel(root)
    light_bill_window.title("Light Bill Options")
    light_bill_window.geometry("400x300")

    create_button(light_bill_window, "Calculate Light Bill of a Room", calculate_light_bill_for_room, 0, 0)
    create_button(light_bill_window, "Calculate Total Bill for Each Room", calculate_total_bill, 0, 1)

def update_room():
    def submit_update():
        room_id = int(entry_room_id.get())
        rooms = load_rooms()
        room = next((r for r in rooms if r["room_id"] == room_id), None)

        if not room:
            messagebox.showerror("Error", f"Room ID {room_id} not found!")
            update_window.destroy()
            return

        try:
            new_holder_name = entry_holder_name.get()
            new_rent = int(entry_rent.get())
            new_light_units = int(entry_light_units.get())
            new_occupied = var_occupied.get()
        except ValueError:
            messagebox.showerror("Error", "Invalid input! Rent and light units must be numbers.")
            return

        room["holder_name"] = new_holder_name
        room["rent"] = new_rent
        room["light_units"] = new_light_units
        room["occupied"] = True if new_occupied == "Occupied" else False

        save_rooms(rooms)
        messagebox.showinfo("Success", f"Room {room_id} updated successfully!")
        update_window.destroy()

    update_window = ttk.Toplevel(root)
    update_window.title("Update Room")
    update_window.geometry("400x350")
    
    ttk.Label(update_window, text="Enter Room ID:").pack(pady=5)
    entry_room_id = ttk.Entry(update_window)
    entry_room_id.pack(pady=5)
    
    ttk.Label(update_window, text="Enter New Holder Name:").pack(pady=5)
    entry_holder_name = ttk.Entry(update_window)
    entry_holder_name.pack(pady=5)
    
    ttk.Label(update_window, text="Enter New Rent:").pack(pady=5)
    entry_rent = ttk.Entry(update_window)
    entry_rent.pack(pady=5)
    
    ttk.Label(update_window, text="Enter Light Units:").pack(pady=5)
    entry_light_units = ttk.Entry(update_window)
    entry_light_units.pack(pady=5)
    
    ttk.Label(update_window, text="Occupied (select one):").pack(pady=5)
    var_occupied = tk.StringVar(value="Occupied")
    ttk.Radiobutton(update_window, text="Occupied", variable=var_occupied, value="Occupied").pack()
    ttk.Radiobutton(update_window, text="Vacant", variable=var_occupied, value="Vacant").pack()
    
    ttk.Button(update_window, text="Submit", command=submit_update, bootstyle="info").pack(pady=10)

def calculate_light_bill_for_room():
    def submit():
        room_id = int(entry.get())
        rooms = load_rooms()
        room = next((r for r in rooms if r["room_id"] == room_id), None)
        if room:
            bill = room["light_units"] * 10  # Assume ₹10 per unit
            messagebox.showinfo("Light Bill", f"Room {room_id} ({room['holder_name']}): Light Bill = ₹{bill}")
        else:
            messagebox.showerror("Error", "Room not found!")
        light_bill_window.destroy()

    light_bill_window = ttk.Toplevel(root)
    light_bill_window.title("Calculate Light Bill")
    ttk.Label(light_bill_window, text="Enter Room ID:").pack(pady=5)
    entry = ttk.Entry(light_bill_window)
    entry.pack(pady=5)
    ttk.Button(light_bill_window, text="Submit", command=submit, bootstyle="info").pack(pady=5)

def calculate_total_bill():
    rooms = load_rooms()
    if not rooms:
        messagebox.showinfo("Total Bill", "No rooms available.")
        return

    info = "\n".join(
        f"Room {room['room_id']} ({room['holder_name']}): Total Bill = ₹{room['rent'] + room['light_units'] * 10} "
        f"(Rent: ₹{room['rent']} + Light Bill: ₹{room['light_units'] * 10})"
        for room in rooms
    )
    messagebox.showinfo("Total Bills", info)

def set_reminder():
    def submit_reminder():
        room_id = int(entry_room_id.get())
        reminder_text = entry_reminder.get()
        rooms = load_rooms()
        room = next((r for r in rooms if r["room_id"] == room_id), None)
        if room:
            if "reminders" not in room:
                room["reminders"] = []
            room["reminders"].append(reminder_text)
            save_rooms(rooms)
            messagebox.showinfo("Success", f"Reminder set for Room {room_id}")
        else:
            messagebox.showerror("Error", "Room not found!")
        reminder_window.destroy()

    reminder_window = ttk.Toplevel(root)
    reminder_window.title("Set Reminder")
    reminder_window.geometry("400x200")

    ttk.Label(reminder_window, text="Enter Room ID:").pack(pady=5)
    entry_room_id = ttk.Entry(reminder_window)
    entry_room_id.pack(pady=5)

    ttk.Label(reminder_window, text="Enter Reminder:").pack(pady=5)
    entry_reminder = ttk.Entry(reminder_window)
    entry_reminder.pack(pady=5)

    ttk.Button(reminder_window, text="Set Reminder", command=submit_reminder, bootstyle="info").pack(pady=10)

def load_rooms():
    """Load room data from JSON file."""
    try:
        if os.path.exists("rooms.json"):
            with open("rooms.json", "r") as file:
                return json.load(file)
    except Exception as e:
        messagebox.showerror("Error", f"Failed to load rooms: {e}")
    return []

def save_rooms(rooms):
    """Save room data to JSON file."""
    try:
        with open("rooms.json", "w") as file:
            json.dump(rooms, file, indent=4)
    except Exception as e:
        messagebox.showerror("Error", f"Failed to save rooms: {e}")

# Create root window
root = ttk.Window(themename="cosmo")
root.geometry("800x600")
root.title("Room Management System")

# Show logo first
show_logo()

# Run the application
root.mainloop()

