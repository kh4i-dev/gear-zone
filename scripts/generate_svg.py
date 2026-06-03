import os

svg_content = """<svg width="100%" viewBox="-40 -40 1680 940" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Sơ đồ chức năng hệ thống GearZone</title>
  <desc>Sơ đồ phân rã chức năng của website bán phụ kiện máy tính gaming GearZone.</desc>

  <defs>
    <style>
      .bg { fill: #ffffff; }
      .root { fill: #ffffff; stroke: #111827; stroke-width: 2; }
      .group { fill: #ffffff; stroke: #111827; stroke-width: 1.5; }
      .leaf { fill: #ffffff; stroke: #111827; stroke-width: 1.2; }
      .root-text { fill: #111827; font: 700 24px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .group-text { fill: #111827; font: 700 16px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .leaf-text { fill: #111827; font: 500 14px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .line { stroke: #111827; stroke-width: 1.5; fill: none; }
    </style>
  </defs>

  <rect id="canvas-bg" class="bg" x="-100" y="-100" width="1800" height="1100" stroke="none"/>

  <!-- Root -->
  <rect class="root" x="600" y="30" width="400" height="70" rx="0"/>
  <text class="root-text" x="800" y="65" text-anchor="middle" dominant-baseline="central">Hệ thống GearZone</text>

  <!-- Main vertical from root -->
  <path class="line" d="M800 100 V140"/>
  <!-- Main horizontal for Row 1 -->
  <path class="line" d="M110 140 H1190"/>
  
  <!-- Main vertical to Row 2 -->
  <path class="line" d="M800 140 V480"/>
  <!-- Main horizontal for Row 2 -->
  <path class="line" d="M440 480 H1160"/>
"""

groups = [
    {
        "title": "1. Xác thực",
        "items": ["Đăng ký", "Đăng nhập", "Đăng xuất"],
        "x_line": 110,
        "row": 1
    },
    {
        "title": "2. Sản phẩm",
        "items": ["Xem danh sách sản phẩm", "Tìm kiếm / lọc sản phẩm", "Xem chi tiết sản phẩm"],
        "x_line": 470,
        "row": 1
    },
    {
        "title": "3. Mua hàng",
        "items": ["Thêm vào giỏ hàng", "Cập nhật giỏ hàng", "Đặt hàng"],
        "x_line": 830,
        "row": 1
    },
    {
        "title": "4. Thanh toán",
        "items": ["Thanh toán online", "Xác nhận thanh toán", "Hoàn tiền / COD"],
        "x_line": 1190,
        "row": 1
    },
    {
        "title": "5. Quản trị",
        "items": ["Quản lý người dùng", "Quản lý danh mục", "Cấu hình hệ thống"],
        "x_line": 440,
        "row": 2
    },
    {
        "title": "6. Đơn hàng",
        "items": ["Quản lý đơn hàng", "Theo dõi trạng thái", "Xử lý hủy đơn"],
        "x_line": 800,
        "row": 2
    },
    {
        "title": "7. Kho vận",
        "items": ["Cập nhật kho", "Xuất kho", "Vận chuyển / trả hàng"],
        "x_line": 1160,
        "row": 2
    }
]

box_width = 260
box_height = 48
gap = 24

for g in groups:
    x_line = g["x_line"]
    x_box = x_line + 30
    
    if g["row"] == 1:
        start_y = 140
        y_box_base = 180
    else:
        start_y = 480
        y_box_base = 520
        
    y_boxes = [y_box_base + i*(box_height + gap) for i in range(4)]
    centers_y = [y + box_height/2 for y in y_boxes]
    
    svg_content += f'\n  <!-- Group: {g["title"]} -->'
    # Vertical line down
    svg_content += f'\n  <path class="line" d="M{x_line} {start_y} V{centers_y[-1]}"/>'
    
    # Title box
    svg_content += f'\n  <path class="line" d="M{x_line} {centers_y[0]} H{x_box}"/>'
    svg_content += f'\n  <rect class="group" x="{x_box}" y="{y_boxes[0]}" width="{box_width}" height="{box_height}" rx="0"/>'
    svg_content += f'\n  <text class="group-text" x="{x_box + box_width/2}" y="{centers_y[0]}" text-anchor="middle" dominant-baseline="central">{g["title"]}</text>'
    
    # Child boxes
    for i, item in enumerate(g["items"]):
        idx = i + 1
        svg_content += f'\n  <path class="line" d="M{x_line} {centers_y[idx]} H{x_box}"/>'
        svg_content += f'\n  <rect class="leaf" x="{x_box}" y="{y_boxes[idx]}" width="{box_width}" height="{box_height}" rx="0"/>'
        svg_content += f'\n  <text class="leaf-text" x="{x_box + box_width/2}" y="{centers_y[idx]}" text-anchor="middle" dominant-baseline="central">{item}</text>'

svg_content += "\n</svg>"

with open("E:/my-project/gear-zone/images/so_do_chuc_nang_gearzone.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)
