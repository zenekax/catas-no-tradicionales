> **Actualización:** el sitio ya no está en Netlify. Hosting y DNS están en Cloudflare
> (nameservers `armando.ns.cloudflare.com` y `nova.ns.cloudflare.com`, cargados en Namecheap).
> Lo de abajo es el historial de la configuración anterior. Ver `docs/DEPLOY.md`.

# Conectar catasnotradicionales.com (Namecheap → Netlify)

Requisito previo: el sitio ya publicado en Netlify (tiene una dirección tipo `algo.netlify.app`).

## Estado actual (hecho)

- Sitio en Netlify: https://catasnotradicionales.netlify.app (proyecto `catasnotradicionales`).
- Dominio `catasnotradicionales.com` agregado al sitio y zona DNS creada en Netlify (con `www` incluido).
- Nameservers a cargar en Namecheap (Custom DNS):
  - `dns1.p05.nsone.net`
  - `dns2.p05.nsone.net`
  - `dns3.p05.nsone.net`
  - `dns4.p05.nsone.net`

## Opción recomendada: Netlify DNS (cambiar nameservers)

Conviene si **no** tenés otros servicios en el dominio, o si los podés volver a cargar en Netlify (por ejemplo, los registros de un mail).

1. En Netlify: **Domain management → Add a domain** → escribí `catasnotradicionales.com` → *Verify* → *Add domain*.
2. Netlify te ofrece **Set up Netlify DNS**. Aceptá. Al final te muestra **4 nameservers** del tipo `dns1.p0X.nsone.net`. Copialos.
3. En Namecheap: **Domain List → Manage** (al lado de catasnotradicionales.com) → sección **NAMESERVERS** → elegí **Custom DNS** → pegá los 4 nameservers → tildá el ✓ verde para guardar.
4. Esperá. Suele tardar entre 15 minutos y unas horas (a veces hasta 48 h).
5. Cuando Netlify detecta el cambio, emite el certificado HTTPS (Let's Encrypt) solo. Lo ves en **Domain management → HTTPS**.
6. Dirección principal: Netlify toma el dominio sin www (`catasnotradicionales.com`) como principal y redirige `www` → sin www automáticamente.

Si más adelante sumás un mail con el dominio (Zoho, Google Workspace, Namecheap Private Email), los registros MX/TXT que te den se cargan en **Netlify → Domains → catasnotradicionales.com → DNS records**.

## Opción B: dejar el DNS en Namecheap

Conviene si ya tenés mail u otros registros andando en Namecheap y no querés moverlos.

1. En Netlify: **Add a domain** → `catasnotradicionales.com` → cuando ofrezca Netlify DNS, elegí **configurar DNS externo**.
2. En Namecheap: **Domain List → Manage → Advanced DNS**. Borrá los registros de “parking” que traiga (URL Redirect / CNAME a parkingpage) y cargá:

| Tipo | Host | Valor | TTL |
|---|---|---|---|
| A Record | `@` | `75.2.60.5` | Automatic |
| CNAME Record | `www` | `NOMBRE-DEL-SITIO.netlify.app.` | Automatic |

3. No toques los registros MX/TXT del mail si los tenés.
4. En Netlify → **HTTPS → Verify DNS configuration → Provision certificate**.

## Cómo verificar que propagó

- Entrá a https://dnschecker.org y buscá `catasnotradicionales.com` (tipo NS para la opción recomendada, tipo A para la B).
- Desde la terminal: `dig NS catasnotradicionales.com +short` o `dig catasnotradicionales.com +short`.
- Abrí https://catasnotradicionales.com y https://www.catasnotradicionales.com: los dos tienen que cargar el sitio con candado, y el de www tiene que redirigir al otro.
