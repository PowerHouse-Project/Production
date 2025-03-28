import os
import json
import random
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime
import numpy as np

font_path_regular = os.path.abspath("../frontend/public/fonts/JetBrainsMono-Regular.ttf")
font_path_bold = os.path.abspath("../frontend/public/fonts/JetBrainsMono-Bold.ttf")

if os.path.exists(font_path_regular):
    jetbrains_font = fm.FontProperties(fname=font_path_regular)
    print(f"✅ Using JetBrains Mono Regular from: {font_path_regular}")
else:
    print(f"❌ Font file not found: {font_path_regular}")
    jetbrains_font = fm.FontProperties()

if os.path.exists(font_path_bold):
    jetbrains_bold_font = fm.FontProperties(fname=font_path_bold)
else:
    jetbrains_bold_font = fm.FontProperties()

if os.path.exists(font_path_regular):
    pdfmetrics.registerFont(TTFont("JetBrainsMono", font_path_regular))
    print(f"✅ JetBrains Mono Regular registered for ReportLab.")
else:
    print(f"❌ Font file not found for ReportLab.")

if os.path.exists(font_path_bold):
    pdfmetrics.registerFont(TTFont("JetBrainsMono-Bold", font_path_bold))
    print(f"✅ JetBrains Mono Bold registered for ReportLab.")
else:
    print(f"❌ JetBrains Mono Bold font file not found: {font_path_bold}")

graphs_folder = os.path.abspath("graphs")
if not os.path.exists(graphs_folder):
    os.makedirs(graphs_folder)
    print(f"✅ Created folder: {graphs_folder}")

THEME_CONFIG = {
    "dark": {
        "bg_color": "#121212",
        "card_color": "#292929",
        "text_color": "#ffffff",
        "accent_colors": ["#8253D7", "#9B6BE6", "#A97DFF", "#6A3BCC", "#5C2FB3"],
        "grid_color": "gray",
    },
    "light": {
        "bg_color": "#ffffff",
        "card_color": "#f5f5f5",
        "text_color": "#000000",
        "accent_colors": ["#1F99FC", "#1A84D9", "#187BB0", "#155C8D", "#134C6A"],
        "grid_color": "lightgray",
    },
}

def load_daily_energy_data(from_day, to_day):
    daily_energy_file_path = os.path.abspath("energy/daily_energy.json")
    if not os.path.exists(daily_energy_file_path):
        print(f"❌ Daily energy data file not found: {daily_energy_file_path}")
        return None

    with open(daily_energy_file_path, "r") as file:
        data = json.load(file)

    filtered_data = []
    for entry in data:
        timestamp = datetime.fromisoformat(entry["timestamp"])
        if from_day <= timestamp <= to_day:
            filtered_data.append(entry)

    return filtered_data

def load_energy_data(from_month, to_month):
    energy_file_path = os.path.abspath("energy/monthly_energy.json")
    if not os.path.exists(energy_file_path):
        print(f"❌ Energy data file not found: {energy_file_path}")
        return None

    with open(energy_file_path, "r") as file:
        data = json.load(file)

    filtered_data = []
    for entry in data:
        timestamp = datetime.fromisoformat(entry["timestamp"])
        if from_month <= timestamp <= to_month:
            filtered_data.append(entry)

    return filtered_data

def load_device_data():
    device_file_path = os.path.abspath("selected_user_devices.json")
    if not os.path.exists(device_file_path):
        print(f"❌ Device data file not found: {device_file_path}")
        return None

    with open(device_file_path, "r") as file:
        data = json.load(file)

    return data["smart_home_devices"]

def load_energy_goal():
    energy_goal_path = os.path.abspath("energy/energy_goal.json")
    if not os.path.exists(energy_goal_path):
        print(f"❌ Energy goal data file not found: {energy_goal_path}")
        return None

    with open(energy_goal_path, "r") as file:
        data = json.load(file)

    return data.get("goal_value", None)

def generate_daily_energy_graph(data, title, x_label, y_label, theme):
    plt.style.use("dark_background" if theme == "dark" else "default")
    fig, ax = plt.subplots(figsize=(6, 3))

    theme_config = THEME_CONFIG[theme]
    fig.patch.set_facecolor(theme_config["card_color"])
    ax.set_facecolor(theme_config["card_color"])

    timestamps = [datetime.fromisoformat(entry["timestamp"]).strftime("%d") for entry in data]
    usage = [entry["power_usage"] / 1000 for entry in data]

    ax.plot(timestamps, usage, marker="o", color=theme_config["accent_colors"][0])

    ax.set_xlabel(x_label, color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_ylabel(y_label, color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_title(title, color=theme_config["accent_colors"][0], fontproperties=jetbrains_bold_font, fontsize=12)

    ax.grid(color=theme_config["grid_color"], linestyle="dashed", linewidth=0.5)

    graph_path = os.path.join(graphs_folder, "daily_energy_graph.png")
    plt.savefig(graph_path, bbox_inches="tight", facecolor=theme_config["card_color"])  
    plt.close()

def generate_monthly_energy_graph(data, title, x_label, y_label, theme):
    plt.style.use("dark_background" if theme == "dark" else "default")
    fig, ax = plt.subplots(figsize=(6, 3))

    theme_config = THEME_CONFIG[theme]
    fig.patch.set_facecolor(theme_config["card_color"])
    ax.set_facecolor(theme_config["card_color"])

    timestamps = [datetime.fromisoformat(entry["timestamp"]).strftime("%b") for entry in data]
    usage = [entry["power_usage"] / 1000 for entry in data]

    ax.plot(timestamps, usage, marker="o", color=theme_config["accent_colors"][0])

    ax.set_xlabel(x_label, color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_ylabel(y_label, color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_title(title, color=theme_config["accent_colors"][0], fontproperties=jetbrains_bold_font, fontsize=12)

    ax.grid(color=theme_config["grid_color"], linestyle="dashed", linewidth=0.5)

    graph_path = os.path.join(graphs_folder, "monthly_energy_graph.png")
    plt.savefig(graph_path, bbox_inches="tight", facecolor=theme_config["card_color"])  
    plt.close()

def generate_device_bar_chart(device_data, device_ids, theme):
    # Remove plt.style.use() since theme_config already manages colors
    fig, ax = plt.subplots(figsize=(6, 3))

    theme_config = THEME_CONFIG[theme]
    fig.patch.set_facecolor(theme_config["card_color"])  # Set background
    ax.set_facecolor(theme_config["card_color"])  # Set axis background

    filtered_devices = [device for device in device_data if device["id"] in device_ids]
    if not filtered_devices:
        print("❌ No devices found for the specified IDs.")
        return

    devices = [device["name"] for device in filtered_devices]
    usage = [device["power_usage"] for device in filtered_devices]

    bars = ax.bar(devices, usage, color=theme_config["accent_colors"][:len(devices)])

    ax.set_xlabel("Devices", color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_ylabel("Power Usage (W)", color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_title("Real-time Device Power Usage", color=theme_config["accent_colors"][0], fontproperties=jetbrains_bold_font, fontsize=12)

    ax.set_xticks([])  # Hide x-axis ticks
    ax.set_xticklabels([])  # Hide x-axis labels

    ax.grid(color=theme_config["grid_color"], linestyle="dashed", linewidth=0.5)

    ax.legend(bars, devices, facecolor=theme_config["card_color"], edgecolor=theme_config["text_color"], labelcolor=theme_config["text_color"], prop=jetbrains_font, fontsize=8, bbox_to_anchor=(0.5, -0.2), loc="upper center", ncol=2)

    graph_path = os.path.join(graphs_folder, "device_bar_chart.png")
    plt.savefig(graph_path, bbox_inches="tight", facecolor=theme_config["card_color"])  
    plt.close()

def generate_energy_goal_chart(data, goal_value, title, x_label, y_label, theme):
    plt.style.use("dark_background" if theme == "dark" else "default")
    fig, ax = plt.subplots(figsize=(6, 3))

    theme_config = THEME_CONFIG[theme]
    fig.patch.set_facecolor(theme_config["card_color"])
    ax.set_facecolor(theme_config["card_color"])

    timestamps = [datetime.fromisoformat(entry["timestamp"]).strftime("%b") for entry in data]
    usage = [entry["power_usage"] / 1000 for entry in data]
    goal_line = [goal_value / 1000] * len(usage)

    ax.fill_between(timestamps, usage, color=theme_config["accent_colors"][0], alpha=0.5, label="Energy Usage")
    ax.plot(timestamps, goal_line, linestyle="dashed", color=theme_config["accent_colors"][1], label="Energy Goal")

    ax.set_xlabel(x_label, color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_ylabel(y_label, color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_title(title, color=theme_config["accent_colors"][0], fontproperties=jetbrains_bold_font, fontsize=12)

    ax.grid(color=theme_config["grid_color"], linestyle="dashed", linewidth=0.5)
    ax.legend(facecolor=theme_config["card_color"], edgecolor=theme_config["text_color"], labelcolor=theme_config["text_color"], 
              prop=jetbrains_font, fontsize=8, bbox_to_anchor=(0.5, -0.2), loc="upper center", ncol=2)

    graph_path = os.path.join(graphs_folder, "energy_goal_chart.png")
    plt.savefig(graph_path, bbox_inches="tight", facecolor=theme_config["card_color"])
    plt.close()


def generate_power_rating_bar_chart(device_data, device_ids, theme):
    # Same change here: remove plt.style.use()
    fig, ax = plt.subplots(figsize=(6, 3))

    theme_config = THEME_CONFIG[theme]
    fig.patch.set_facecolor(theme_config["card_color"])
    ax.set_facecolor(theme_config["card_color"])

    filtered_devices = [device for device in device_data if device["id"] in device_ids]
    if not filtered_devices:
        print("❌ No devices found for the specified IDs.")
        return

    devices = [device["name"] for device in filtered_devices]
    power_ratings = [device["power_rating"] for device in filtered_devices]

    bars = ax.bar(devices, power_ratings, color=theme_config["accent_colors"][:len(devices)])

    ax.set_xlabel("Devices", color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_ylabel("Power Rating (W)", color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)
    ax.set_title("Device Power Ratings", color=theme_config["accent_colors"][0], fontproperties=jetbrains_bold_font, fontsize=12)

    ax.set_xticks([])  # Hide x-axis ticks
    ax.set_xticklabels([])  # Hide x-axis labels

    ax.grid(color=theme_config["grid_color"], linestyle="dashed", linewidth=0.5)

    ax.legend(bars, devices, facecolor=theme_config["card_color"], edgecolor=theme_config["text_color"], labelcolor=theme_config["text_color"], prop=jetbrains_font, fontsize=8, bbox_to_anchor=(0.5, -0.2), loc="upper center", ncol=2)

    graph_path = os.path.join(graphs_folder, "power_rating_bar_chart.png")
    plt.savefig(graph_path, bbox_inches="tight", facecolor=theme_config["card_color"])  
    plt.close()

def generate_gauge_chart(value, title, theme):
    plt.style.use("dark_background" if theme == "dark" else "default")
    fig, ax = plt.subplots(figsize=(6, 3), subplot_kw={'projection': 'polar'})
    fig.subplots_adjust(bottom=0.2)

    theme_config = THEME_CONFIG[theme]
    fig.patch.set_facecolor(theme_config["card_color"])
    ax.set_facecolor(theme_config["card_color"])

    theta = np.linspace(0, np.pi, 100) 
    r = np.ones_like(theta)

    ax.plot(theta, r, color=theme_config["accent_colors"][0], linewidth=3)
    ax.fill_between(theta, 0, r, color=theme_config["accent_colors"][0], alpha=0.5)

    needle_theta = value / 100 * np.pi
    ax.plot([needle_theta, needle_theta], [0, 1], color=theme_config["accent_colors"][1], linewidth=2)

    ax.set_ylim(0, 1)
    ax.set_yticklabels([])
    ax.set_xticks(np.linspace(0, np.pi, 5))
    ax.set_xticklabels(['0', '25', '50', '75', '100'], color=theme_config["text_color"], fontproperties=jetbrains_font, fontsize=10)

    ax.set_title(title, color=theme_config["accent_colors"][0], fontproperties=jetbrains_bold_font, fontsize=12, pad=20)

    comparison_text = "You've used 20% less energy than the average household."
    plt.figtext(0.5, 0.05, comparison_text, ha='center', va='center', color=theme_config["accent_colors"][0], fontproperties=jetbrains_font, fontsize=12)

    graph_path = os.path.join(graphs_folder, "gauge_chart.png")
    plt.savefig(graph_path, bbox_inches="tight", facecolor=theme_config["card_color"])
    plt.close()

def get_random_energy_tip():
    with open("energy_tips.json", "r") as file:
        data = json.load(file)
    category = random.choice(["highEnergyTip", "mediumEnergyTip"])
    tip = random.choice(data[category])
    return tip["tip"]

def generate_pdf(from_month, to_month, from_day, to_day, device_ids, theme="dark"):
    print(f"Received from_month: {from_month}, to_month: {to_month}, from_day: {from_day}, to_day: {to_day}")

    from_month = datetime(2024, from_month, 1)
    to_month = datetime(2024, to_month, 1)
    from_day = datetime(2025, 3, from_day)
    to_day = datetime(2025, 3, to_day)

    for file in os.listdir():
        if file.startswith("Energy Report") and file.endswith(".pdf"):
            os.remove(file)
            print(f"🗑️ Deleted previous report: {file}")

    pdf_filename = f"Energy Report - {str(from_month)[:10]}, {str(from_day)[:10]} to {str(to_month)[:10]}, {str(to_day)[:10]}.pdf"
    c = canvas.Canvas(pdf_filename, pagesize=letter)
    
    theme_config = THEME_CONFIG[theme]
    c.setFillColor(colors.HexColor(theme_config["bg_color"]))
    c.rect(0, 0, letter[0], letter[1], fill=True, stroke=False)
    
    accent_color = colors.HexColor(theme_config["accent_colors"][0])

    c.setFillColor(accent_color)
    if os.path.exists(font_path_bold):
        c.setFont("JetBrainsMono-Bold", 30)
    else:
        c.setFont("JetBrainsMono", 30)

    text = "PowerHouse"
    text_width = c.stringWidth(text, "JetBrainsMono-Bold" if os.path.exists(font_path_bold) else "JetBrainsMono", 30)
    centered_x = (letter[0] - text_width) / 2
    c.drawString(centered_x, 730, text)

    date_range_text = f"Date Range: {from_month.strftime('%b %Y')} - {to_month.strftime('%b %Y')}"
    c.setFont("JetBrainsMono", 12)
    date_range_width = c.stringWidth(date_range_text, "JetBrainsMono", 12)
    centered_date_x = (letter[0] - date_range_width) / 2
    c.drawString(centered_date_x, 710, date_range_text)

    daily_energy_data = load_daily_energy_data(from_day, to_day)
    if not daily_energy_data:
        print("❌ No daily energy data found.")
        return

    monthly_energy_data = load_energy_data(from_month, to_month)
    if not monthly_energy_data:
        print("❌ No monthly energy data found for the specified range.")
        return

    device_data = load_device_data()
    if not device_data:
        print("❌ No device data found.")
        return
    
    energy_goal = load_energy_goal()
    if not energy_goal:
        print("❌ No Goal data found.")
        return

    card_width, card_height = 250, 150
    padding = 20

    card1_x, card1_y = 50, 530
    card2_x, card2_y = card1_x + card_width + padding, card1_y

    c.setFillColor(colors.HexColor(theme_config["card_color"]))
    c.rect(card1_x, card1_y, card_width, card_height, fill=True, stroke=False)

    generate_daily_energy_graph(daily_energy_data, "Daily Energy Usage", "Day", "Energy (kWh)", theme)
    graph_width, graph_height = 230, 130
    daily_graph_path = os.path.join(graphs_folder, "daily_energy_graph.png")
    c.drawImage(daily_graph_path, card1_x + 10, card1_y + 10, width=graph_width, height=graph_height, preserveAspectRatio=True, mask=None)

    c.setFillColor(colors.HexColor(theme_config["card_color"]))
    c.rect(card2_x, card2_y, card_width, card_height, fill=True, stroke=False)

    generate_monthly_energy_graph(monthly_energy_data, "Monthly Energy Usage", "Month", "Energy (kWh)", theme)
    monthly_graph_path = os.path.join(graphs_folder, "monthly_energy_graph.png")
    c.drawImage(monthly_graph_path, card2_x + 10, card2_y + 10, width=230, height=130, preserveAspectRatio=True, mask=None)

    card3_x, card3_y = 50, card1_y - card_height - padding
    card4_x, card4_y = card2_x, card3_y

    c.setFillColor(colors.HexColor(theme_config["card_color"]))
    c.rect(card3_x, card3_y, card_width, card_height, fill=True, stroke=False)

    generate_device_bar_chart(device_data, device_ids, theme)
    device_graph_path = os.path.join(graphs_folder, "device_bar_chart.png")
    c.drawImage(device_graph_path, card3_x + 10, card3_y + 10, width=230, height=130, preserveAspectRatio=True, mask=None)

    c.setFillColor(colors.HexColor(theme_config["card_color"]))
    c.rect(card4_x, card4_y, card_width, card_height, fill=True, stroke=False)

    generate_power_rating_bar_chart(device_data, device_ids, theme)
    power_rating_graph_path = os.path.join(graphs_folder, "power_rating_bar_chart.png")
    c.drawImage(power_rating_graph_path, card4_x + 10, card4_y + 10, width=230, height=130, preserveAspectRatio=True, mask=None)

    card5_x, card5_y = 50, card3_y - 80
    card5_width = letter[0] - 90
    card5_height = 60

    c.setFillColor(colors.HexColor(theme_config["card_color"]))
    c.rect(card5_x, card5_y, card5_width, card5_height, fill=True, stroke=False)

    c.setFont("JetBrainsMono", 12)
    c.setFillColor(colors.HexColor(theme_config["text_color"]))

    energy_tip = get_random_energy_tip()
    
    text_y = card5_y + card5_height - 20

    c.setFont("JetBrainsMono-Bold", 14)
    c.setFillColor(colors.HexColor(theme_config["accent_colors"][0]))
    energy_tip_title = "Energy Tip:"
    energy_tip_title_width = c.stringWidth(energy_tip_title, "JetBrainsMono-Bold", 14)
    centered_title_x = card5_x + (card5_width - energy_tip_title_width) / 2
    c.drawString(centered_title_x, text_y - 5, energy_tip_title)

    c.setFont("JetBrainsMono", 10)
    c.setFillColor(colors.HexColor(theme_config["text_color"]))
    energy_tip_width = c.stringWidth(energy_tip, "JetBrainsMono", 10)
    centered_tip_x = card5_x + (card5_width - energy_tip_width) / 2
    c.drawString(centered_tip_x, text_y - 20, energy_tip)

    card6_x, card6_y = 50, card5_y - card_height - padding
    card7_x, card7_y = card6_x + card_width + padding, card6_y

    c.setFillColor(colors.HexColor(theme_config["card_color"]))
    c.rect(card6_x, card6_y, card_width, card_height, fill=True, stroke=False)

    generate_energy_goal_chart(monthly_energy_data, energy_goal, "Energy Goal Tracking", "Month", "Energy (kWh)", theme)
    energy_goal_graph_path = os.path.join(graphs_folder, "energy_goal_chart.png")
    c.drawImage(energy_goal_graph_path, card6_x + 10, card6_y + 10, width=230, height=130, preserveAspectRatio=True, mask=None)

    c.setFillColor(colors.HexColor(theme_config["card_color"]))
    c.rect(card7_x, card7_y, card_width, card_height, fill=True, stroke=False)

    generate_gauge_chart(75, "Energy Efficiency", theme)  # Example value for the gauge chart
    gauge_chart_path = os.path.join(graphs_folder, "gauge_chart.png")
    c.drawImage(gauge_chart_path, card7_x + 10, card7_y + 10, width=230, height=130, preserveAspectRatio=True, mask=None)

    c.setFillColor(colors.HexColor(theme_config["accent_colors"][0]))
    c.setFont("JetBrainsMono-Bold", 12)
    footer_text = "Generated from System. All rights reserved PowerHouse Inc."
    footer_width = c.stringWidth(footer_text, "JetBrainsMono-Bold", 12)
    centered_footer_x = (letter[0] - footer_width) / 2
    c.drawString(centered_footer_x, 20, footer_text)

    c.save()
    print(f"✅ PDF saved as {pdf_filename}")

    return os.path.abspath(pdf_filename)

# from_month = datetime(2024, 4, 1)
# to_month = datetime(2024, 12, 31)
# from_day = datetime(2025, 3, 1)
# to_day = datetime(2025, 3, 15)
# device_ids = [1, 2, 3, 4, 5, 6]
# generate_pdf(from_month, to_month, from_day, to_day, device_ids, "dark")