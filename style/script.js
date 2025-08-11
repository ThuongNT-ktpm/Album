const book = document.getElementById("book");
const pages = [];

/** ---------- Trang intro ---------- */
const introPage = document.createElement("div");
introPage.className = "page";
introPage.dataset.originalZ = 100;
introPage.style.zIndex = 100;

const introFront = document.createElement("div");
introFront.className = "front";
introFront.innerHTML = `
  <div class="intro-content">
    <h1>Memory Album</h1>
    <div><em>Ảnh Xóm Tôi</em></div>
    <div>🎁❤️🎁</div>
  </div>
`;
const introBack = document.createElement("div");
introBack.className = "back";
introPage.appendChild(introFront);
introPage.appendChild(introBack);
book.appendChild(introPage);
pages.push(introPage);

/** ---------- Danh sách ảnh ----------
 * Thư mục: ./style/image/
 * File: 1.jpg … 12.jpg
 */
const images = [];
const TOTAL = 12; // <-- chỉnh theo số ảnh bạn có
for (let i = 1; i <= TOTAL; i++) {
  images.push(`./style/image/${i}.jpg`);
}

/** ---------- Tạo các trang ảnh (mỗi trang: 2 mặt) ---------- */
for (let i = 0; i < images.length; i += 2) {
  const page = document.createElement("div");
  page.className = "page";
  const z = 99 - i;
  page.dataset.originalZ = z;
  page.style.zIndex = z;

  const front = document.createElement("div");
  front.className = "front";
  const frontImg = document.createElement("img");
  frontImg.loading = "lazy";
  frontImg.src = images[i];
  frontImg.onerror = () => console.warn("Không tải được:", frontImg.src);
  front.appendChild(frontImg);

  const back = document.createElement("div");
  back.className = "back";
  if (images[i + 1]) {
    const backImg = document.createElement("img");
    backImg.loading = "lazy";
    backImg.src = images[i + 1];
    backImg.onerror = () => console.warn("Không tải được:", backImg.src);
    back.appendChild(backImg);
  }

  page.appendChild(front);
  page.appendChild(back);
  book.appendChild(page);
  pages.push(page);
}

/** ---------- Trang kết ---------- */
const endPage = document.createElement("div");
endPage.className = "page";
endPage.dataset.originalZ = 0;
endPage.style.zIndex = 0;

const endFront = document.createElement("div");
endFront.className = "front";
endFront.innerHTML = `
  <div class="end-content">
    <h2>By Tiến Thương</h2>
    <span id="ending-text"></span>
  </div>
`;
const endBack = document.createElement("div");
endBack.className = "back";
endBack.style.background = "#fff";
endPage.appendChild(endFront);
endPage.appendChild(endBack);
book.appendChild(endPage);
pages.push(endPage);

/** ---------- Hiệu ứng gõ chữ ---------- */
function typewriterEffect(text, element, speed = 40) {
  let i = 0;
  (function type() {
    if (i < text.length) {
      element.innerHTML += text[i] === "\n" ? "<br>" : text[i];
      i++;
      setTimeout(type, speed);
    }
  })();
}

/** ---------- Lật trang: hỗ trợ tốt cho điện thoại ----------
 * - Dùng Pointer Events (thống nhất chuột + cảm ứng)
 * - Ngưỡng vuốt dựa theo bề rộng (15%)
 * - touch-action: pan-y trong CSS để chặn trượt ngang của trình duyệt
 */
let currentTopZ = 200;
let typed = false;

pages.forEach((page) => {
  const front = page.querySelector(".front");
  const back = page.querySelector(".back");

  // tăng vùng nhấp cho mobile
  front.style.padding = "8px";
  back.style.padding = "8px";

  const flipForward = () => {
    if (!page.classList.contains("flipped")) {
      page.classList.add("flipped");

      // gõ chữ ở trang kế cuối (trước endPage)
      if (page === pages[pages.length - 2] && !typed) {
        const endText = document.getElementById("ending-text");
        const content = `không gì cả`;
        setTimeout(() => typewriterEffect(content, endText), 500);
        typed = true;
      }

      setTimeout(() => {
        page.style.zIndex = 0;
      }, 700);
    }
  };

  const flipBackward = () => {
    if (page.classList.contains("flipped")) {
      page.classList.remove("flipped");
      currentTopZ++;
      page.style.zIndex = currentTopZ;
    }
  };

  // Click/tap
  front.addEventListener("click", flipForward, { passive: true });
  back.addEventListener("click", flipBackward, { passive: true });

  // Vuốt ngang bằng Pointer Events
  let startX = 0,
    startY = 0,
    moved = false;
  const threshold = () => Math.max(30, book.clientWidth * 0.15); // 15% bề rộng hoặc 30px

  const onDown = (e) => {
    startX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    startY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    moved = false;
  };

  const onMove = (e) => {
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    if (Math.abs(x - startX) > 6 || Math.abs(y - startY) > 6) moved = true;
  };

  const onUp = (e) => {
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
    const dx = endX - startX;

    if (Math.abs(dx) >= threshold()) {
      if (dx < 0) flipForward(); // vuốt trái
      else flipBackward(); // vuốt phải
    } else if (!moved) {
      // tap nhẹ cũng lật
      if (e.currentTarget === front) flipForward();
      else flipBackward();
    }
  };

  // Đăng ký cả pointer + touch (fallback cho iOS cũ)
  page.addEventListener("pointerdown", onDown, { passive: true });
  page.addEventListener("pointermove", onMove, { passive: true });
  page.addEventListener("pointerup", onUp, { passive: true });

  page.addEventListener("touchstart", onDown, { passive: true });
  page.addEventListener("touchmove", onMove, { passive: true });
  page.addEventListener("touchend", onUp, { passive: true });
});
