/* =========================================
   APLIKASI KEUANGAN
========================================= */


/* =========================================
   DATA TRANSAKSI
========================================= */

// Ambil data dari LocalStorage
let transaksi = JSON.parse(
    localStorage.getItem("transaksi")
) || [];

// ID transaksi yang sedang diedit
let editId = null;


/* =========================================
   ELEMENT
========================================= */

const formContainer =
    document.getElementById("formContainer");

const daftarTransaksi =
    document.getElementById("daftarTransaksi");

const filterBulan =
    document.getElementById("filterBulan");


/* =========================================
   SAAT APLIKASI DIBUKA
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Set bulan sekarang
        const sekarang = new Date();

        const tahun =
            sekarang.getFullYear();

        const bulan =
            String(
                sekarang.getMonth() + 1
            ).padStart(2, "0");

        filterBulan.value =
            `${tahun}-${bulan}`;


        // Set tanggal hari ini
        document.getElementById(
            "tanggal"
        ).value = formatTanggalInput(
            sekarang
        );


        // Tampilkan data
        tampilkanTransaksi();

        hitungTotal();

    }
);


/* =========================================
   FORM
========================================= */

function bukaForm() {

    formContainer.style.display =
        "block";

    document.getElementById(
        "judulForm"
    ).textContent =
        "Tambah Transaksi";

    editId = null;

    document.getElementById(
        "jenis"
    ).value = "pemasukan";

    document.getElementById(
        "nominal"
    ).value = "";

    document.getElementById(
        "kategori"
    ).value = "Gaji";

    document.getElementById(
        "tanggal"
    ).value = formatTanggalInput(
        new Date()
    );

    document.getElementById(
        "catatan"
    ).value = "";

    window.scrollTo({
        top: formContainer.offsetTop - 20,
        behavior: "smooth"
    });
}


function tutupForm() {

    formContainer.style.display =
        "none";

    editId = null;

}


/* =========================================
   SIMPAN TRANSAKSI
========================================= */

function simpanTransaksi() {

    const jenis =
        document.getElementById(
            "jenis"
        ).value;

    const nominal =
        Number(
            document.getElementById(
                "nominal"
            ).value
        );

    const kategori =
        document.getElementById(
            "kategori"
        ).value;

    const tanggal =
        document.getElementById(
            "tanggal"
        ).value;

    const catatan =
        document.getElementById(
            "catatan"
        ).value.trim();


    /* VALIDASI */

    if (!nominal || nominal <= 0) {

        alert(
            "Nominal harus lebih dari Rp 0."
        );

        return;
    }


    if (!tanggal) {

        alert(
            "Silakan pilih tanggal transaksi."
        );

        return;
    }


    /* =====================================
       MODE EDIT
    ===================================== */

    if (editId !== null) {

        const index =
            transaksi.findIndex(
                function (item) {

                    return item.id === editId;

                }
            );


        if (index !== -1) {

            transaksi[index] = {

                ...transaksi[index],

                jenis: jenis,

                nominal: nominal,

                kategori: kategori,

                tanggal: tanggal,

                catatan: catatan

            };

        }

    }


    /* =====================================
       MODE TAMBAH
    ===================================== */

    else {

        const data = {

            id: Date.now(),

            jenis: jenis,

            nominal: nominal,

            kategori: kategori,

            tanggal: tanggal,

            catatan: catatan

        };

        transaksi.push(data);

    }


    /* SIMPAN */

    localStorage.setItem(
        "transaksi",
        JSON.stringify(transaksi)
    );


    /* UPDATE */

    tampilkanTransaksi();

    hitungTotal();

    tutupForm();

}


/* =========================================
   TAMPILKAN TRANSAKSI
========================================= */

function tampilkanTransaksi() {

    const bulanDipilih =
        filterBulan.value;


    let dataTampil =
        transaksi.filter(
            function (item) {

                return item.tanggal.startsWith(
                    bulanDipilih
                );

            }
        );


    /* URUTKAN DARI TERBARU */

    dataTampil.sort(
        function (a, b) {

            return new Date(b.tanggal)
                - new Date(a.tanggal);

        }
    );


    /* JUMLAH */

    document.getElementById(
        "jumlahTransaksi"
    ).textContent =
        `${dataTampil.length} transaksi`;


    /* JIKA KOSONG */

    if (dataTampil.length === 0) {

        daftarTransaksi.innerHTML = `

            <div class="kosong">

                <div class="kosong-icon">
                    📋
                </div>

                <h3>
                    Belum ada transaksi
                </h3>

                <p>
                    Tambahkan transaksi pertama kamu.
                </p>

            </div>

        `;

        return;
    }


    /* =====================================
       BUAT HTML
    ===================================== */

    daftarTransaksi.innerHTML = "";


    dataTampil.forEach(
        function (item) {

            const masuk =
                item.jenis === "pemasukan";


            const icon =
                masuk
                    ? "📈"
                    : "📉";


            const tanda =
                masuk
                    ? "+"
                    : "-";


            const warna =
                masuk
                    ? "masuk"
                    : "keluar";


            const nominal =
                formatRupiah(
                    item.nominal
                );


            const tanggal =
                formatTanggal(
                    item.tanggal
                );


            daftarTransaksi.innerHTML += `

                <div class="transaksi">

                    <div class="transaksi-kiri">

                        <div class="transaksi-icon ${warna}">
                            ${icon}
                        </div>


                        <div class="transaksi-info">

                            <h4>
                                ${escapeHTML(
                                    item.kategori
                                )}
                            </h4>

                            <p>
                                ${tanggal}
                                ${item.catatan
                                    ? " • " +
                                      escapeHTML(
                                          item.catatan
                                      )
                                    : ""
                                }
                            </p>

                        </div>

                    </div>


                    <div class="transaksi-kanan">

                        <div class="nominal ${warna}">

                            ${tanda}
                            ${nominal}

                        </div>


                        <div class="aksi">

                            <button
                                class="btn-edit"
                                onclick="editTransaksi(${item.id})">

                                Edit

                            </button>


                            <button
                                class="btn-hapus"
                                onclick="hapusTransaksi(${item.id})">

                                Hapus

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================
   HITUNG TOTAL
========================================= */

function hitungTotal() {

    const bulanDipilih =
        filterBulan.value;


    let pemasukan = 0;

    let pengeluaran = 0;


    transaksi.forEach(
        function (item) {

            // Hanya bulan yang dipilih
            if (
                !item.tanggal.startsWith(
                    bulanDipilih
                )
            ) {

                return;

            }


            if (
                item.jenis === "pemasukan"
            ) {

                pemasukan +=
                    item.nominal;

            } else {

                pengeluaran +=
                    item.nominal;

            }

        }
    );


    const saldo =
        pemasukan - pengeluaran;


    /* TAMPILKAN */

    document.getElementById(
        "totalPemasukan"
    ).textContent =
        formatRupiah(pemasukan);


    document.getElementById(
        "totalPengeluaran"
    ).textContent =
        formatRupiah(pengeluaran);


    document.getElementById(
        "saldo"
    ).textContent =
        formatRupiah(saldo);

}


/* =========================================
   EDIT TRANSAKSI
========================================= */

function editTransaksi(id) {

    const item =
        transaksi.find(
            function (data) {

                return data.id === id;

            }
        );


    if (!item) {
        return;
    }


    editId = id;


    document.getElementById(
        "judulForm"
    ).textContent =
        "Edit Transaksi";


    document.getElementById(
        "jenis"
    ).value =
        item.jenis;


    document.getElementById(
        "nominal"
    ).value =
        item.nominal;


    document.getElementById(
        "kategori"
    ).value =
        item.kategori;


    document.getElementById(
        "tanggal"
    ).value =
        item.tanggal;


    document.getElementById(
        "catatan"
    ).value =
        item.catatan;


    formContainer.style.display =
        "block";


    window.scrollTo({
        top: formContainer.offsetTop - 20,
        behavior: "smooth"
    });

}


/* =========================================
   HAPUS TRANSAKSI
========================================= */

function hapusTransaksi(id) {

    const yakin =
        confirm(
            "Apakah kamu yakin ingin menghapus transaksi ini?"
        );


    if (!yakin) {
        return;
    }


    transaksi =
        transaksi.filter(
            function (item) {

                return item.id !== id;

            }
        );


    localStorage.setItem(
        "transaksi",
        JSON.stringify(transaksi)
    );


    tampilkanTransaksi();

    hitungTotal();

}


/* =========================================
   FILTER BULAN
========================================= */

filterBulan.addEventListener(
    "change",
    function () {

        tampilkanTransaksi();

        hitungTotal();

    }
);


/* =========================================
   FORMAT RUPIAH
========================================= */

function formatRupiah(angka) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",

            currency: "IDR",

            minimumFractionDigits: 0
        }
    ).format(angka);

}


/* =========================================
   FORMAT TANGGAL
========================================= */

function formatTanggal(tanggal) {

    const date =
        new Date(
            tanggal + "T00:00:00"
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",

            month: "short",

            year: "numeric"
        }
    );

}


/* =========================================
   FORMAT UNTUK INPUT DATE
========================================= */

function formatTanggalInput(date) {

    const tahun =
        date.getFullYear();


    const bulan =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const hari =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${tahun}-${bulan}-${hari}`;

}


/* =========================================
   KEAMANAN HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
