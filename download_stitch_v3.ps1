$outDir = 'c:\Users\2p7\Desktop\Nova pasta\sucatabet\stitch_v3_references'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir }

$downloads = @(
  @{ Name='dashboard'; Img='https://lh3.googleusercontent.com/aida/ADBb0uioZjtb2OOEHIl4H8pu57X2jFKszRJLv3nu3NbHTwmTmP-JFlzkjNwxdGp35nBd9gaKmQNfcvMSV-EoE6LVtSoPkH5-8dYorqvZsQJSO_aE5b3fpCfDCCXKFscj1cLIE4KaTGY7DgzO1TSe1JZwIbjuF0YWoS2Ia-tviLeNPB0LvBcpSj7MtdmpCt0zTklsUVCRhQB9vOZyAoTs6EZTtoijnMHfwsY1sgaot0tRGIzwVjszf8_WFadZCow'; Code='https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2QxNGVjNTg4Y2MyZTQ2ZjA5MzI3NzhhOTIxZTEwNTQ1EgsSBxCTiq3Gxh8YAZIBIwoKcHJvamVjdF9pZBIVQhM0MTc1NTEwNzI0NzExODYyNTAy&filename=&opi=89354086' },
  @{ Name='operacoes'; Img='https://lh3.googleusercontent.com/aida/ADBb0ugvjczYbqa8dCpLzgblmn4b7UMzRQbk843o0mCKb9_YXX2WxYETfd7XE7oAUIlx1q0F7-F3GKs6k4_WYqf-Zz47D4P9iQlVUYal8EwdC2MIix3C9lJ-VMOzxIRZ_Sa0gKUjD0O8qjTelIN6lJbKHZn7ORmi6HGUIKNDaLGLC2HMw4-MS6UEB8QXgH0WO6AV9d2Ol4lQzK0zKSQHEvhkTEASqEslRe3byUhN-qoZjy5ufhNnwZ_ScgwJONw'; Code='https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0ZGVlYzkwOGRhNWMwMjJkNTNlNmU2MmY1M2JkEgsSBxCTiq3Gxh8YAZIBIwoKcHJvamVjdF9pZBIVQhM0MTc1NTEwNzI0NzExODYyNTAy&filename=&opi=89354086' },
  @{ Name='calculadora'; Img='https://lh3.googleusercontent.com/aida/ADBb0ugrUjiG94MXeFNkaUqs54xlHcFI5gegQUApuy4ZJpbK4pau4n49AteoU-SVm-5pxGAGN0lter6S6v0qddPg_pERp2Zu8xKfEvrLvQ2IriGVHJp-sDhMIMIKdr9QpTWSH_XBYNi0zQIKNHyvbbZAc5T2K4DLm2auvjXx1ahyWsDhp9wPQxFa_dU1Sj6nDZdSyxAhXc3mKU4VIRyY8kCZ7idzqQQukV6-9oSJmMjLlB_xYY5Xf0u9jw4O8g'; Code='https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0ZGVlOGM1NTJiYWUwMWViNDc0OGVkMjJkNzk5EgsSBxCTiq3Gxh8YAZIBIwoKcHJvamVjdF9pZBIVQhM0MTc1NTEwNzI0NzExODYyNTAy&filename=&opi=89354086' },
  @{ Name='freebets'; Img='https://lh3.googleusercontent.com/aida/ADBb0ugwYaypCC6SHyBQjt1FkXLfPJe65LjWeliXkGzEF22ikOJKfn3J1Xeyj_gtSq0DyCzRhcF4AQsEQLYk5VYXn77ir1y3M3n7_jaHRX5uN0_w5CqFRREGeu2x3S6pQmRta_Y6LlZ3ufjFjAAIsrJ2RVt78WmDXh9iXS9B7zAC1J_pvae1VoPNOBiHk7KA4_Q40xM6uGcQOKmRavVShEXKl-bpa700v474RcSOixxR2xJpgUMw6O_2sKVH9w'; Code='https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0ZGVlOWE3ZjEyYmIwN2M0ZWNlMDViMDQ2NzIxEgsSBxCTiq3Gxh8YAZIBIwoKcHJvamVjdF9pZBIVQhM0MTc1NTEwNzI0NzExODYyNTAy&filename=&opi=89354086' },
  @{ Name='alertas'; Img='https://lh3.googleusercontent.com/aida/ADBb0uiDVrkV4AojVZR5GlpjQENWRItdTL8mCF0j8iMU59Xj0qu8un_fcdQcquaYwdUGsrVjHyp0Qs2jfYExIHlbT9qvLLdZDB9vz3h3Zf4tPON4VqT2qD7GzZyYgWt_ztVcaa9q5fEw4WtOABTsfN6QQDEkPsbVa8ZRRfZWN62vBqLg7znya9XS12EVTSvTPR9Ufcvuhx_i2HhADGArxneAojEIZavdgcF9VyMkqv5BNGfI9ZLGA85SiBK_sA'; Code='https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzYzZTBlNDE5MjBlYTQ5ZmY4ZTAyMWMzOWMzMTA0ZmQzEgsSBxCTiq3Gxh8YAZIBIwoKcHJvamVjdF9pZBIVQhM0MTc1NTEwNzI0NzExODYyNTAy&filename=&opi=89354086' },
  @{ Name='contas'; Img='https://lh3.googleusercontent.com/aida/ADBb0ui9QSK5iyWclGJaYkHj_ILhkpyoTvKR5TpENPooUrE5NQF7UuL2YxNxdp9fUCG0vx6CIaEd-5vWXIwnOrlTlFjnaEDdHPXjMNCRRVzcU7Cl3z-6rpT8Or878JGioAAGd74pzQW3UbgG_DR7vtsQkGlRAwsaFIYx42J9mbPsl4QRZTMsVg5Y_5jPY_Tm13Hv0WCLkSJiNENfNlqEs0lFW98FGmFQKo8B_EagmfDHTxE_i-fI2g9dkm1i2D8'; Code='https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0ZGVlNzBkNDgyNWMwOTI1YzFjZjdhMmI4ZjA4EgsSBxCTiq3Gxh8YAZIBIwoKcHJvamVjdF9pZBIVQhM0MTc1NTEwNzI0NzExODYyNTAy&filename=&opi=89354086' },
  @{ Name='admin'; Img='https://lh3.googleusercontent.com/aida/ADBb0uj73lfFSsD13Y3o1HtyoUa0ff4d22KGqI20ejWtk_1rc5_yMi4mAMw4inzUxWQWroWp7tLAi3TlDy1vCnsfi-c4rGwzSwaCP7NSrx3hKpoMzOP3QT0GJGqbKjTFbApF2OwXa435d4HL-5Np5w3a8Q7YqD--eFnAnyFYbc3peenB_vIzaK2b69qL2tIVtZXdcScwGaO5s5ow_1-QlaZo3c2BX-TC7x1qShvZSc2udXirexaebCUUzuIIdlk'; Code='https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2FiNzk0ODUwZGQxMzQ1YTNiZTdkYmM1MzdmOTMxZmI5EgsSBxCTiq3Gxh8YAZIBIwoKcHJvamVjdF9pZBIVQhM0MTc1NTEwNzI0NzExODYyNTAy&filename=&opi=89354086' }
)

foreach ($dl in $downloads) {
  $imgFile = Join-Path $outDir ($dl.Name + '.png')
  $htmFile = Join-Path $outDir ($dl.Name + '.html')
  
  Write-Host "Baixando $($dl.Name)..."
  curl.exe -s -L $dl.Img -o $imgFile
  curl.exe -s -L $dl.Code -o $htmFile
}

Write-Host "=== DOWNLOAD CONCLUIDO ==="
