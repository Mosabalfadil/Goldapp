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

      if (
        u === localStorage.getItem("USER") &&
        p === localStorage.getItem("PASS")
      ) {
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
  const groupNameInput   = document.getElementById("groupNameInput");
  const groupSelect      = document.getElementById("groupSelect");
  const searchInput      = document.getElementById("searchInput");
  const personsTable     = document.getElementById("personsTable");
  const shopsTable       = document.getElementById("shopsTable");
  const currentGroupTitle= document.getElementById("currentGroupTitle");

  const sumGiveEl    = document.getElementById("sumGive");
  const sumTakeEl    = document.getElementById("sumTake");
  const sumBalanceEl = document.getElementById("sumBalance");
  const countPersonsEl = document.getElementById("countPersons");
  const sumShopsEl   = document.getElementById("sumShops");

  /* =====================================================
     5) أدوات مساعدة
  ===================================================== */
  const today = () => new Date().toLocaleDateString();

  function unformatNumber(v) {
    return parseFloat(String(v).replace(/,/g, "")) || 0;
  }

  function formatNumber(n) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const num = v => unformatNumber(v);

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

    sumGiveEl.innerText = formatNumber(give);
    sumTakeEl.innerText = formatNumber(take);
    sumBalanceEl.innerText = formatNumber(give - take);
    countPersonsEl.innerText = currentGroup.persons.length;
    sumShopsEl.innerText = formatNumber(shops);
  }

  /* =====================================================
     8) المجموعات
  ===================================================== */
  window.createGroup = function () {
    const name = groupNameInput.value.trim();
    if (!name) return alert("اكتب اسم المجموعة");
    groups.push({ name, persons: [], shops: [] });
    groupNameInput.value = "";
    saveGroups();
    renderGroupSelect();
  };

  window.deleteGroup = function () {
    if (!currentGroup) return;
    if (!confirm("هل تريد حذف المجموعة؟")) return;

    groups.splice(groupSelect.value, 1);
    saveGroups();
    currentGroup = null;
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

        <td>
          <input type="text"
            value="${formatNumber(p.give)}"
            onfocus="this.value=unformatNumber(this.value)"
            onblur="pGive(${i},this.value)">
        </td>

        <td>
          <input type="text"
            value="${formatNumber(p.take)}"
            onfocus="this.value=unformatNumber(this.value)"
            onblur="pTake(${i},this.value)">
        </td>

        <td id="bal_${i}">${formatNumber(p.give - p.take)}</td>
        <td>${p.date}</td>
        <td><button onclick="delPerson(${i})">✖</button></td>
      </tr>`;
    });
  }

  function updateBalance(i){
    document.getElementById("bal_"+i).innerText =
      formatNumber(
        currentGroup.persons[i].give -
        currentGroup.persons[i].take
      );
  }

  window.pName = (i,v)=>{currentGroup.persons[i].name=v;saveGroups();};
  window.pGive = (i,v)=>{currentGroup.persons[i].give=num(v);saveGroups();updateBalance(i);updateDashboard();};
  window.pTake = (i,v)=>{currentGroup.persons[i].take=num(v);saveGroups();updateBalance(i);updateDashboard();};
  window.delPerson = i=>{currentGroup.persons.splice(i,1);saveGroups();renderPersons();updateDashboard();};

  /* =====================================================
     10) الميز
  ===================================================== */
  window.addShop = function () {
    currentGroup.shops.push({shop:"",price:0,delivery:"",note:"",date:today()});
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
        <td>
          <input type="text"
            value="${formatNumber(s.price)}"
            onfocus="this.value=unformatNumber(this.value)"
            onblur="sPrice(${i},this.value)">
        </td>
        <td><input value="${s.delivery}" oninput="sDel(${i},this.value)"></td>
        <td><input value="${s.note}" oninput="sNote(${i},this.value)"></td>
        <td>${s.date}</td>
        <td><button onclick="delShop(${i})">✖</button></td>
      </tr>`;
    });
  }

  window.sShop=(i,v)=>{currentGroup.shops[i].shop=v;saveGroups();};
  window.sPrice=(i,v)=>{currentGroup.shops[i].price=num(v);saveGroups();updateDashboard();};
  window.sDel=(i,v)=>{currentGroup.shops[i].delivery=v;saveGroups();};
  window.sNote=(i,v)=>{currentGroup.shops[i].note=v;saveGroups();};
  window.delShop=i=>{currentGroup.shops.splice(i,1);saveGroups();renderShops();updateDashboard();};

  /* =====================================================
     11) البحث
  ===================================================== */
  window.searchInGroup = function () {
    const q = searchInput.value.toLowerCase();
    [...personsTable.rows].forEach((r,i)=>{
      if(i===0) return;
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  };

  /* =====================================================
     12) تسجيل الخروج
  ===================================================== */
  window.logout = function () {
    localStorage.removeItem("LOGIN");
    localStorage.removeItem("REMEMBER");
    location.replace("login.html");
  };

  renderGroupSelect();
  updateDashboard();
});
