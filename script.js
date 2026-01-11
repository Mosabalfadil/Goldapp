document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     1) إعداد المستخدم الافتراضي
  ===================================================== */
  if (!localStorage.getItem("USER")) {
    localStorage.setItem("USER", "admin");
    localStorage.setItem("PASS", "1234");
  }

  /* =====================================================
     2) صفحة تسجيل الدخول
  ===================================================== */
  const usernameEl = document.getElementById("username");
  if (usernameEl) {

    if (localStorage.getItem("REMEMBER") === "1") {
      localStorage.setItem("LOGIN", "1");
      location.replace("index.html");
    }

    window.login = function () {
      const u = usernameEl.value;
      const p = document.getElementById("password").value;
      const err = document.getElementById("loginError");
      const remember = document.getElementById("rememberMe");

      if (u === localStorage.getItem("USER") && p === localStorage.getItem("PASS")) {
        localStorage.setItem("LOGIN", "1");
        remember.checked
          ? localStorage.setItem("REMEMBER", "1")
          : localStorage.removeItem("REMEMBER");
        location.href = "index.html";
      } else {
        err.innerText = "بيانات غير صحيحة";
      }
    };
    return;
  }

  /* =====================================================
     3) حماية الصفحة الرئيسية
  ===================================================== */
  if (localStorage.getItem("LOGIN") !== "1") {
    location.replace("login.html");
    return;
  }

  /* =====================================================
     4) عناصر الصفحة
  ===================================================== */
  const groupNameInput    = document.getElementById("groupNameInput");
  const groupSelect       = document.getElementById("groupSelect");
  const searchInput       = document.getElementById("searchInput");
  const personsTable      = document.getElementById("personsTable");
  const shopsTable        = document.getElementById("shopsTable");
  const currentGroupTitle = document.getElementById("currentGroupTitle");

  const sumGiveEl    = document.getElementById("sumGive");
  const sumTakeEl    = document.getElementById("sumTake");
  const sumBalanceEl = document.getElementById("sumBalance");
  const countPersonsEl = document.getElementById("countPersons");
  const sumShopsEl   = document.getElementById("sumShops");

  /* =====================================================
     5) أدوات مساعدة
  ===================================================== */
  const today = () => new Date().toLocaleDateString();
  const num = v => parseFloat(String(v).replace(/,/g, "")) || 0;
  const fmt = n => n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  /* =====================================================
     6) البيانات
  ===================================================== */
  let groups = JSON.parse(localStorage.getItem("groups")) || [];
  let currentGroup = null;
  const saveGroups = () =>
    localStorage.setItem("groups", JSON.stringify(groups));

  /* =====================================================
     7) Dashboard
  ===================================================== */
  function updateDashboard() {
    if (!currentGroup) {
      sumGiveEl.innerText =
      sumTakeEl.innerText =
      sumBalanceEl.innerText =
      sumShopsEl.innerText = "0.00";
      countPersonsEl.innerText = "0";
      return;
    }

    let give = 0, take = 0, shops = 0;
    currentGroup.persons.forEach(p => { give += p.give; take += p.take; });
    currentGroup.shops.forEach(s => shops += s.price);

    sumGiveEl.innerText = fmt(give);
    sumTakeEl.innerText = fmt(take);
    sumBalanceEl.innerText = fmt(give - take);
    countPersonsEl.innerText = currentGroup.persons.length;
    sumShopsEl.innerText = fmt(shops);
  }

  /* =====================================================
     8) المجموعات
  ===================================================== */
  window.createGroup = function () {
    if (!groupNameInput.value.trim()) return;
    groups.push({ name: groupNameInput.value.trim(), persons: [], shops: [] });
    groupNameInput.value = "";
    saveGroups();
    renderGroupSelect();
  };

  window.deleteGroup = function () {
    if (!currentGroup) return;
    if (!confirm("هل تريد حذف المجموعة؟")) return;

    groups.splice(groupSelect.value, 1);
    currentGroup = null;
    saveGroups();
    personsTable.innerHTML = "";
    shopsTable.innerHTML = "";
    currentGroupTitle.innerText = "";
    renderGroupSelect();
    updateDashboard();
  };

  function renderGroupSelect() {
    groupSelect.innerHTML = "";
    groups.forEach((g, i) => {
      const o = document.createElement("option");
      o.value = i;
      o.textContent = g.name;
      groupSelect.appendChild(o);
    });
    if (groups.length) {
      groupSelect.value = 0;
      selectGroup();
    }
  }

  window.selectGroup = function () {
    currentGroup = groups[groupSelect.value];
    currentGroupTitle.innerText = "المجموعة: " + currentGroup.name;
    renderPersons();
    renderShops();
    updateDashboard();
  };

  /* =====================================================
     9) الأشخاص
  ===================================================== */
  window.addPerson = function () {
    currentGroup.persons.push({ name:"", give:0, take:0, date: today() });
    saveGroups();
    renderPersons();
    updateDashboard();
  };

  function renderPersons() {
    personsTable.innerHTML = `
      <tr>
        <th>م</th><th>الاسم</th><th>له</th><th>عليه</th>
        <th>المتبقي</th><th>التاريخ</th><th>حذف</th>
      </tr>`;
    currentGroup.persons.forEach((p, i) => {
      personsTable.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td><input value="${p.name}" oninput="pName(${i},this.value)"></td>
        <td><input value="${fmt(p.give)}" onblur="pGive(${i},this.value)"></td>
        <td><input value="${fmt(p.take)}" onblur="pTake(${i},this.value)"></td>
        <td>${fmt(p.give - p.take)}</td>
        <td>${p.date}</td>
        <td><button onclick="delPerson(${i})">✖</button></td>
      </tr>`;
    });
  }

  window.pName = (i,v)=>{currentGroup.persons[i].name=v;saveGroups();};
  window.pGive = (i,v)=>{currentGroup.persons[i].give=num(v);saveGroups();renderPersons();updateDashboard();};
  window.pTake = (i,v)=>{currentGroup.persons[i].take=num(v);saveGroups();renderPersons();updateDashboard();};
  window.delPerson = i=>{currentGroup.persons.splice(i,1);saveGroups();renderPersons();updateDashboard();};

  /* =====================================================
     10) الميز
  ===================================================== */
  window.addShop = function () {
    currentGroup.shops.push({ shop:"", price:0, delivery:"", note:"", date:today() });
    saveGroups();
    renderShops();
    updateDashboard();
  };

  function renderShops() {
    shopsTable.innerHTML = `
      <tr>
        <th>الدكان</th><th>القيمة</th><th>التوصيل</th>
        <th>ملاحظات</th><th>التاريخ</th><th>حذف</th>
      </tr>`;
    currentGroup.shops.forEach((s,i)=>{
      shopsTable.innerHTML += `
      <tr>
        <td><input value="${s.shop}" oninput="sShop(${i},this.value)"></td>
        <td><input value="${fmt(s.price)}" onblur="sPrice(${i},this.value)"></td>
        <td><input value="${s.delivery}" oninput="sDel(${i},this.value)"></td>
        <td><input value="${s.note}" oninput="sNote(${i},this.value)"></td>
        <td>${s.date}</td>
        <td><button onclick="delShop(${i})">✖</button></td>
      </tr>`;
    });
  }

  window.sShop=(i,v)=>{currentGroup.shops[i].shop=v;saveGroups();};
  window.sPrice=(i,v)=>{currentGroup.shops[i].price=num(v);saveGroups();renderShops();updateDashboard();};
  window.sDel=(i,v)=>{currentGroup.shops[i].delivery=v;saveGroups();};
  window.sNote=(i,v)=>{currentGroup.shops[i].note=v;saveGroups();};
  window.delShop=i=>{currentGroup.shops.splice(i,1);saveGroups();renderShops();updateDashboard();};

  /* =====================================================
     11) البحث بالاسم فقط
  ===================================================== */
  window.searchInGroup = function () {
    const q = searchInput.value.trim().toLowerCase();
    [...personsTable.rows].forEach((row, i) => {
      if (i === 0) return;
      const name = row.cells[1].querySelector("input").value.toLowerCase();
      row.style.display = name.includes(q) ? "" : "none";
    });
  };

  /* =====================================================
     12) تغيير كلمة المرور (محلي)
  ===================================================== */
  window.openChangePass = () =>
    document.getElementById("changePassBox").style.display = "block";

  window.closeChangePass = () =>
    document.getElementById("changePassBox").style.display = "none";

  window.changePassword = function () {
    const oldP = oldPass.value;
    const newP = newPass.value;
    const msg  = passMsg;

    if (oldP !== localStorage.getItem("PASS")) {
      msg.innerText = "كلمة المرور القديمة غير صحيحة";
      return;
    }
    if (newP.length < 4) {
      msg.innerText = "كلمة المرور قصيرة جدًا";
      return;
    }

    localStorage.setItem("PASS", newP);
    msg.innerText = "تم تغيير كلمة المرور";

    setTimeout(() => {
      localStorage.removeItem("LOGIN");
      localStorage.removeItem("REMEMBER");
      location.replace("login.html");
    }, 1200);
  };

  /* =====================================================
     13) تسجيل الخروج
  ===================================================== */
  window.logout = function () {
    localStorage.removeItem("LOGIN");
    localStorage.removeItem("REMEMBER");
    location.replace("login.html");
  };

  renderGroupSelect();
  updateDashboard();
});
