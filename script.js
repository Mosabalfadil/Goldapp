document.addEventListener("DOMContentLoaded", () => {

  /* ================= DEFAULT USER ================= */
  if (!localStorage.getItem("USER")) {
    localStorage.setItem("USER", "admin");
    localStorage.setItem("PASS", "1234");
  }

  /* ================= LOGIN PAGE ================= */
  if (document.getElementById("username")) {

    if (localStorage.getItem("REMEMBER") === "1") {
      localStorage.setItem("LOGIN", "1");
      location.replace("index.html");
    }

    window.login = function () {
      const u = document.getElementById("username").value;
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

  /* ================= PROTECT PAGE ================= */
  if (localStorage.getItem("LOGIN") !== "1") {
    location.replace("login.html");
    return;
  }

  /* ================= LOGOUT ================= */
  window.logout = function () {
    localStorage.removeItem("LOGIN");
    localStorage.removeItem("REMEMBER");
    location.replace("login.html");
  };

  /* ================= CHANGE PASSWORD ================= */
  window.openChangePass = () =>
    document.getElementById("changePassBox").style.display = "block";

  window.closeChangePass = () =>
    document.getElementById("changePassBox").style.display = "none";

  window.changePassword = function () {
    const oldP = document.getElementById("oldPass").value;
    const newP = document.getElementById("newPass").value;
    const msg = document.getElementById("passMsg");

    if (oldP !== localStorage.getItem("PASS")) {
      msg.innerText = "كلمة المرور القديمة غير صحيحة";
      return;
    }
    if (newP.length < 4) {
      msg.innerText = "كلمة المرور قصيرة جدًا";
      return;
    }

    localStorage.setItem("PASS", newP);
    msg.innerText = "تم تغيير كلمة المرور بنجاح";
  };

  /* ================= ELEMENTS ================= */
  const groupNameInput = document.getElementById("groupNameInput");
  const groupSelect = document.getElementById("groupSelect");
  const searchInput = document.getElementById("searchInput");
  const personsTable = document.getElementById("personsTable");
  const shopsTable = document.getElementById("shopsTable");
  const currentGroupTitle = document.getElementById("currentGroupTitle");

  const sumGiveEl = document.getElementById("sumGive");
  const sumTakeEl = document.getElementById("sumTake");
  const sumBalanceEl = document.getElementById("sumBalance");
  const countPersonsEl = document.getElementById("countPersons");
  const sumShopsEl = document.getElementById("sumShops");

  const today = () => new Date().toLocaleDateString();
  const num = v => parseFloat(String(v).replace(",", ".")) || 0;

  let groups = JSON.parse(localStorage.getItem("groups")) || [];
  let currentGroup = null;

  const saveGroups = () =>
    localStorage.setItem("groups", JSON.stringify(groups));

  /* ================= DASHBOARD ================= */
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

    currentGroup.persons.forEach(p => {
      give += p.give;
      take += p.take;
    });

    currentGroup.shops.forEach(s => shops += s.price);

    sumGiveEl.innerText = give.toFixed(2);
    sumTakeEl.innerText = take.toFixed(2);
    sumBalanceEl.innerText = (give - take).toFixed(2);
    countPersonsEl.innerText = currentGroup.persons.length;
    sumShopsEl.innerText = shops.toFixed(2);
  }

  /* ================= BACKUP ================= */
  window.backup = function () {
    const blob = new Blob([JSON.stringify(groups, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_groups.json";
    a.click();
  };

  /* ================= GROUPS ================= */
  window.createGroup = function () {
    if (!groupNameInput.value.trim()) return alert("اكتب اسم المجموعة");
    groups.push({ name: groupNameInput.value.trim(), persons: [], shops: [] });
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

  /* ================= PERSONS ================= */
  window.addPerson = function () {
    currentGroup.persons.push({ name: "", give: 0, take: 0, date: today() });
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
        <td>${i + 1}</td>
        <td><input value="${p.name}" oninput="pName(${i},this.value)"></td>
        <td><input type="number" value="${p.give}" oninput="pGive(${i},this.value)"></td>
        <td><input type="number" value="${p.take}" oninput="pTake(${i},this.value)"></td>
        <td>${(p.give - p.take).toFixed(2)}</td>
        <td>${p.date}</td>
        <td><button onclick="delPerson(${i})">✖</button></td>
      </tr>`;
    });
  }

  window.pName = (i,v)=>{currentGroup.persons[i].name=v;saveGroups();};
  window.pGive = (i,v)=>{currentGroup.persons[i].give=num(v);saveGroups();updateDashboard();};
  window.pTake = (i,v)=>{currentGroup.persons[i].take=num(v);saveGroups();updateDashboard();};
  window.delPerson=i=>{currentGroup.persons.splice(i,1);saveGroups();renderPersons();updateDashboard();};

  /* ================= SHOPS ================= */
  window.addShop=function(){
    currentGroup.shops.push({shop:"",price:0,delivery:"",note:"",date:today()});
    saveGroups();renderShops();updateDashboard();
  };

  function renderShops(){
    shopsTable.innerHTML=`
      <tr>
        <th>الدكان</th><th>القيمة</th><th>التوصيل</th>
        <th>ملاحظات</th><th>التاريخ</th><th>حذف</th>
      </tr>`;
    currentGroup.shops.forEach((s,i)=>{
      shopsTable.innerHTML+=`
      <tr>
        <td><input value="${s.shop}" oninput="sShop(${i},this.value)"></td>
        <td><input type="number" value="${s.price}" oninput="sPrice(${i},this.value)"></td>
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

  /* ================= SEARCH ================= */
  window.searchInGroup=function(){
    const q=searchInput.value.toLowerCase();
    [...personsTable.rows].forEach((r,i)=>{
      if(i===0)return;
      r.style.display=r.innerText.toLowerCase().includes(q)?"":"none";
    });
  };

  /* ================= EXPORT PDF ================= */
  window.exportPDF = function () {
    if (!currentGroup) return alert("اختر مجموعة أولاً");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(`المجموعة: ${currentGroup.name}`, 10, 10);
    let y = 20;

    currentGroup.persons.forEach(p => {
      doc.text(`${p.name} | له: ${p.give} | عليه: ${p.take}`, 10, y);
      y += 8;
    });

    doc.save(`group_${currentGroup.name}.pdf`);
  };

  renderGroupSelect();
  updateDashboard();
});
