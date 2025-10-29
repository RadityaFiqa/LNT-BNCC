<?php
// Data produk
$produk = [
    ["kode" => "A001", "nama" => "Indomie Goreng", "harga" => 3500, "stok" => 100],
    ["kode" => "A002", "nama" => "Teh Botol Sosro", "harga" => 4000, "stok" => 50],
    ["kode" => "A003", "nama" => "Susu Ultra Milk", "harga" => 12000, "stok" => 30],
    ["kode" => "A004", "nama" => "Roti Tawar Sari Roti", "harga" => 15000, "stok" => 20],
    ["kode" => "A005", "nama" => "Minyak Goreng Bimoli 1L", "harga" => 18000, "stok" => 15]
];

// 1. Mencari produk berdasarkan kode (return data produk atau null)
function cariProduk(array $array_produk, string $kode)
{
    foreach ($array_produk as $item) {
        if ($item['kode'] === $kode) {
            return $item;
        }
    }
    return null;
}

// 2. Hitung subtotal (harga x jumlah)
function hitungSubtotal(int $harga, int $jumlah): int
{
    return $harga * $jumlah;
}

// 3. Hitung diskon berdasarkan total belanja
function hitungDiskon(int $total): int
{
    if ($total >= 100000) {
        return (int) round($total * 0.10, 0);
    } elseif ($total >= 50000) {
        return (int) round($total * 0.05, 0);
    }
    return 0;
}

// 4. Hitung pajak PPN (default 11%)
function hitungPajak(int $total, int $persen = 11): int
{
    return (int) round($total * ($persen / 100), 0);
}

// 5. Kurangi stok (pass by reference)
function kurangiStok(array &$produk, int $jumlah): void
{
    if (!isset($produk['stok'])) {
        return;
    }
    $produk['stok'] = max(0, $produk['stok'] - $jumlah);
}

// 6. Format rupiah
function formatRupiah(int $angka): string
{
    return 'Rp ' . number_format($angka, 0, ',', '.');
}

// Helper: ambil index produk di array utama
function cariIndexProduk(array $array_produk, string $kode): ?int
{
    foreach ($array_produk as $idx => $item) {
        if ($item['kode'] === $kode) {
            return $idx;
        }
    }
    return null;
}

// Helper: format tanggal Indonesia
function tanggalIndonesia(DateTime $dt): string
{
    $bulan = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $d = (int) $dt->format('j');
    $m = (int) $dt->format('n');
    $y = (int) $dt->format('Y');
    return $d . ' ' . $bulan[$m] . ' ' . $y;
}

// 7. Buat dan tampilkan struk belanja
function buatStrukBelanja(array $transaksi, array &$array_produk): void
{
    $subtotal = 0;
    $itemDiproses = [];

    echo "========================================\n";
    echo "         MINIMARKET SEJAHTERA\n";
    echo "========================================\n";
    echo "Tanggal: " . tanggalIndonesia(new DateTime()) . "\n\n";

    foreach ($transaksi as $t) {
        $kode = $t['kode'] ?? '';
        $jumlah = (int) ($t['jumlah'] ?? 0);

        $data = cariProduk($array_produk, $kode);
        if ($data === null) {
            echo "[Dilewati] Kode $kode tidak ditemukan.\n\n";
            continue;
        }

        $index = cariIndexProduk($array_produk, $kode);
        if ($index === null) {
            echo "[Dilewati] Kode $kode tidak ditemukan di data stok.\n\n";
            continue;
        }

        // Validasi stok
        $stokTersedia = $array_produk[$index]['stok'];
        if ($jumlah <= 0) {
            echo "[Dilewati] Jumlah beli untuk {$data['nama']} tidak valid.\n\n";
            continue;
        }
        if ($stokTersedia < $jumlah) {
            echo "[Dilewati] Stok {$data['nama']} tidak cukup. Stok: $stokTersedia.\n\n";
            continue;
        }

        $barisSubtotal = hitungSubtotal($data['harga'], $jumlah);
        $subtotal += $barisSubtotal;

        echo $data['nama'] . "\n";
        echo formatRupiah($data['harga']) . ' x ' . $jumlah . str_repeat(' ', 8) . '= ' . formatRupiah($barisSubtotal) . "\n\n";

        // Kurangi stok pada array utama
        kurangiStok($array_produk[$index], $jumlah);
        $itemDiproses[] = [
            'nama' => $data['nama'],
            'sisa' => $array_produk[$index]['stok']
        ];
    }

    echo "----------------------------------------\n";
    echo str_pad('Subtotal', 21, ' ', STR_PAD_RIGHT) . '= ' . formatRupiah($subtotal) . "\n";

    $nominalDiskon = hitungDiskon($subtotal);
    $persenDiskon = $subtotal >= 100000 ? 10 : ($subtotal >= 50000 ? 5 : 0);
    echo 'Diskon (' . $persenDiskon . "%)" . str_repeat(' ', 13 - strlen((string)$persenDiskon)) . '= ' . formatRupiah($nominalDiskon) . "\n";

    $setelahDiskon = $subtotal - $nominalDiskon;
    echo str_pad('Subtotal stl diskon', 21, ' ', STR_PAD_RIGHT) . '= ' . formatRupiah($setelahDiskon) . "\n";

    $pajak = hitungPajak($setelahDiskon, 11);
    echo 'PPN (11%)' . str_repeat(' ', 16) . '= ' . formatRupiah($pajak) . "\n";

    echo "----------------------------------------\n";
    $totalBayar = $setelahDiskon + $pajak;
    echo str_pad('TOTAL BAYAR', 21, ' ', STR_PAD_RIGHT) . '= ' . formatRupiah($totalBayar) . "\n";
    echo "========================================\n\n";

    if (!empty($itemDiproses)) {
        echo "Status Stok Setelah Transaksi:\n";
        foreach ($itemDiproses as $itm) {
            echo '- ' . $itm['nama'] . ': ' . $itm['sisa'] . " pcs\n";
        }
        echo "========================================\n";
    }

    echo "     Terima kasih atas kunjungan Anda\n";
    echo "========================================\n";
}

// ------------------------------------------------------------
// Contoh penggunaan (sesuai contoh soal)
$transaksi = [
    ["kode" => "A001", "jumlah" => 5], // Indomie Goreng 5
    ["kode" => "A003", "jumlah" => 2], // Susu Ultra Milk 2
    ["kode" => "A004", "jumlah" => 1], // Roti Tawar 1
];

buatStrukBelanja($transaksi, $produk);

// Jika perlu menampilkan seluruh stok setelahnya, bisa uncomment:
// echo "\nDaftar stok terkini:\n"; print_r($produk);
