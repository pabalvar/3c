#include "FiveWin.ch"
#include "TcBrowse.ch"
#include "publisql.ch"
#include "btnget.ch"
#define xtitulo     1
#define enpesos     2
#define tdpaim      3
#define mayorlinpa  4
#define adocumento  6
#define tsaldoant   7
#define tabono      8
#define tsaldoact   9
#define ndedocus    10
#define tvadp       11
#define tvaasdp     12
#define tvasadp     13
#define tabdp       14
#define tsaldoantd  15
#define tabonod     16
#define tsaldoactd  17
#define tvadpd      18
#define tvaasdpd    19
#define tvasadpd    20
//---------------------------------------------------------------------------------------------------------
Function PagosDpr3c( oWnd, TabpriGen, aPagos )
Local oDlg, oBtnVolver, oBtnBuscar, oBtnGrabar, oBtnCancelar,Obtnasigdoc
Local oLbx1, oLbx2, oLbx3, bPasoPag, bDocumento, bPasoAdd
Local oReferencia, nReg, cMaestro, cCodigo, cNombre, dev
Local aResultado := {}
Local cCanRedon,CCANREDON2,ctitulo,l188,o58,bcolsal, oAsignaFecha
Local i := 0
Local abSumas := Array(7)
Local nRec := 0
Local nSuma := 0
Local lGrabar := .F.
Local cAyudaPago := "PAGOS_000"
Local aMaeEn := { "MAEEN",;
                 {"MAEEN.TIEN","MAEEN.KOEN","MAEEN.SUEN","MAEEN.NOKOEN"},;
                 {"MAEEN.KOEN","MAEEN.SUEN"},;
                 NIL,;
                 .F.,;
                 {"TIEN","KOEN","SUEN","NOKOEN"},;
                 {"Tipo",OemToansi("C¢digo"),"Suc","Nombre"},;
                 { 35,90,35,400 },;
                 {.f.,.f.,.f.,.f.},;
                 "Maestro de Entidades" }
Local TMaes := {}
Local oChkSucursal
Local lSoloSucursal := .F.
Local cSucursal := ""
local Ocriterio
local ncriterio := 1
Local lCriterio := .F.
local verendosos:= .f.
Local TabPri := ACLone( TabPriGen )
Local nTasaActual := tabpri[tamona]   /// guardo la tasa y la recupero de salida
Local oCritEval
Local nCritEval := 1
Local l241
LOCAL AUX, oSayOtraEmpresa
local smn,sme, nSegundo
local tmonfe,ta,nuevafech,lExistenPermisos
MEMVAR DEF_REDON, ARROBAE, tabobs
Private lAsigFech, lRet, lExistePermiFecha

lExistePermiFecha := ExisteRestriccion( TabPri[cusua], "NO000100" )  // no permitir pagos con venc. superior al ult. venc. del documento

// existen documentos que soliciten permiso?
iif(CuentaRegSQL( "TABTIDO", " WHERE COALESCE(PERMISOS,0)>0 " ) > 0,lExistenPermisos := .T.,lExistenPermisos := .f.)

// verifica tasas para la fecha
tabpri[fechtamo]:= date()
If tabpri[doblemo]
   If faltantasas(tabpri[fechtamo])
      Return NIL
   Endif
   tmonfe:= tasamone(nil,tabpri[fechtamo],.t.,1)
   tabpri[tamona]:= tasamone("US$",tabpri[fechtamo],.f.,2)
Else
   tmonfe:= {{"   ",0,""}}
   TabPri[tamona] := 1
Endif

smn:= tabpri[monenac]
sme:= "US$"
IniciaTabObs(tabobs)

lAsigFech := .T.
lRet := .f.

If tabpri[doblemo]
   cTitulo:= " Nacional  " + DtoC(TabPri[fechtamo])
Else
   cTitulo:= " "+tabpri[quemonedoc] + "  " + DtoC(TabPri[fechtamo])
EndIf

Iif(DEF_REDON == 0, cCanRedon  := ARROBAE + " 99999,999,999",cCanRedon  := ARROBAE + " 999,999,999.99" )
cCanRedon2 := ARROBAE + " 999,999,999.99"
Bcolsal:={||  IIF(apagos[enpesos],"Saldo Ant...","SaldoAnt.US$")}

aPagos := Array(20)
aFill( aPagos, 0 )
apagos[adocumento] := {{Spac(13),Spac(50),tabpri[sucursal],tabpri[caja],tabpri[cusua]}}

tabpri[valpie]  := 0

If !OpenPagosr3c()
  Return NIL
EndIf

apagos[enpesos] := .t.

IF tabpri[sistema] == "ventas"
      apagos[tabdp]:= {"EFV EFECTIVO","CHV CHEQUE BANCARIO","TJV TARJETA DE CREDITO","LTV LETRA DE CAMBIO",;
                       "PAV PAGARE DE CREDITO","DEP PAGO POR DEPOSITO","ATB TRANSFERENCIA BANCARIA"}
      aPagos[xtitulo] := "Pagos a Estado de Cuenta (Ventas)"
      cAyudaPago := "PAGOS_001"
ELSE
      apagos[tabdp]:= {"EFC EFECTIVO","CHC CHEQUE EMPRESA ","TJC TARJETA DE CREDITO","LTC LETRA DE CAMBIO",;
                       "PAC PAGARE DE CREDITO","PTB TRANSFERENCIA BANCARIA"}
      aPagos[xtitulo] := "Pagos a Estado de Cuenta (Compras)"
      cAyudaPago := "PAGOS_003"
ENDIF

apagos[tsaldoant] := 0 ; apagos[tabono]    := 0 ; apagos[tsaldoact] := 0 ; apagos[tvadp]     := 0
apagos[tvaasdp]   := 0 ; apagos[tvasadp]   := 0 ; apagos[tsaldoantd]:= 0 ; apagos[tabonod]   := 0
apagos[tsaldoactd]:= 0 ; apagos[tvadpd]    := 0 ; apagos[tvaasdpd]  := 0 ; apagos[tvasadpd]  := 0 ; apagos[ndedocus] := 0

PasoDeuT->(dbgotop())
WHILE PasoDeuT->(!eof())
   apagos[tsaldoant] += PasoDeuT->saldoant
   apagos[tabono]    += PasoDeuT->abono
   apagos[tsaldoact] += PasoDeuT->saldoact

   apagos[tsaldoantd] += PasoDeuT->saldoantd
   apagos[tabonod]    += PasoDeuT->abonod
   apagos[tsaldoactd] += PasoDeuT->saldoactd
   apagos[ndedocus]++
   PasoDeuT->(dbskip())
ENDDO

// set key F4 ...
SetKey( 115 , {|| BuscadorLocal( oDlg, oLbx3 ) } )

PasoDeu->(dbgotop()) ; PasoPag->(dbgotop())
aPagos[mayorlinpa]:=0
WHILE PasoPag->(!eof())
   apagos[tvadp]     += PasoPag->vadp
   apagos[tvaasdp]   += PasoPag->vaasdp + PasoPag->vavudp
   apagos[tvasadp]   += PasoPag->vasadp - PasoPag->vavudp
   apagos[tvadpd]    += PasoPag->vadpd
   apagos[tvaasdpd]  += PasoPag->vaasdpd + PasoPag->vavudpd
   apagos[tvasadpd]  += PasoPag->vasadpd - PasoPag->vavudpd
   aPagos[mayorlinpa]++
   IF !PasoPag->nuevop
      apagos[ndedocus]++
      apagos[ndedocus]++
   ENDIF
   PasoPag->(dbskip())
ENDDO
PasoPag->(dbgotop())

bPasoAdd := {|| PasoPag->(dbappend()),;
                PasoPag->linea  := aPagos[mayorlinpa],;
                PasoPag->empresa:= tabpri[laempresa],;
                PasoPag->endp   := PasoEn->KoEn,;
                PasoPag->feemdp := Date(),;
                PasoPag->fevedp := Date(),;
                IIF(apagos[enpesos],;
                   ( PasoPag->modp  := tabpri[monenac],;
                     PasoPag->timodp:= "N",;
                     PasoPag->TAmodp:= TABPRI[tamona]),;
                   ( PasoPag->modp  := tabpri[quemonedoc],;
                     PasoPag->TAmodp:= TABPRI[tamona],;
                     PasoPag->timodp:= "E")),;
                     pasopag->nuevop:= .t.}

bPasoPag := {|| PasoPag->( dbZap() ),;
                aPagos[mayorlinpa]:= 1,;
                Eval( bPasoAdd ),;
                oLbx3:Refresh() }

abSumas[2] := {|| iif(apagos[enpesos],apagos[tvadp]    ,apagos[tvadpd]    )}
abSumas[3] := {|| iif(apagos[enpesos],apagos[tvaasdp]  ,apagos[tvaasdpd]  )}
abSumas[4] := {|| iif(apagos[enpesos],apagos[tvasadp]  ,apagos[tvasadpd]  )}
abSumas[5] := {|| iif(apagos[enpesos],apagos[tsaldoant],apagos[tsaldoantd])}
abSumas[6] := {|| iif(apagos[enpesos],apagos[tabono]   ,apagos[tabonod]   )}
abSumas[7] := {|| iif(apagos[enpesos],apagos[tsaldoact],apagos[tsaldoactd])}

Recurso( "Gestion.dll" )
DEFINE DIALOG oDlg RESNAME "Pagosr3c" TITLE aPagos[xtitulo] Of oWnd

REDEFINE CHECKBOX oAsignaFecha VAR lAsigFech ID 59 Of oDlg ;
         ON CLICK If( lAsigFech,;
                      MsgInfo( "Asignación de pagos tomará fecha actual : "+DtoC(Date()), "ATENCION" ),;
                      If( ConPermi(odlg,TabPri,TabPri[cusua],"TO000050"),;
                          MsgInfo( "Asignación de pagos tomará fecha de emisión del pago", "ATENCION" ),;
                          ( lAsigFech := .T.,;
                            oAsignaFecha:Refresh() ) ) )

oLbx1 := TbRam():ReDefine( 151,;
                {|| { aPagos[adocumento][1,1], aPagos[adocumento][1,2]," ",tabpri[laempresa], aPagos[adocumento][1,3], aPagos[adocumento][1,4], aPagos[adocumento][1,5]," " } },;
                oDlg,;
                {"Entidad", "Nombre"," ","Empresa","Suc.","Caja","Resp."," " },;
                {95,350,20,50,30,34,40,10},,,,,,,,,,,, .F.,,,,, )
oLbx1:SetArray( aPagos[adocumento] )
oLbx1:oHScroll   := NIL
oLbx1:lMChange   := .f.
oLbx1:lCellStyle := .T.
oLbx1:bGotFocus  := {|| TomaFoco(oLbx1) }
oLbx1:bLostFocus := {|| DejaFoco(oLbx1) }
oLbx1:bKeyDown   := {|| PedirEntidad(tabpri,apagos, oLbx1, oLbx2, oLbx3, oDlg,.F., abSumas, ncriterio,verendosos, If( nCritEval==2,.t.,.f.), lSoloSucursal, oBtnCancelar  )}
oLbx1:bldblclick := {|| PedirEntidad(tabpri,apagos, oLbx1, oLbx2, oLbx3, oDlg,.T., abSumas, ncriterio,verendosos, If( nCritEval==2,.t.,.f.), lSoloSucursal, oBtnCancelar  )}

REDEFINE SAY oReferencia PROMPT PasoPag->refanti + " " + pasopag->docrelant  ID 101 of oDlg

Select PASOPAG
oLbx2 := TBRam():ReDefine( 152,{|| { AllTrim(Str(PasoPag->linea,3)),PasoPag->tidp, PasoPag->nucudp, DtoC( PasoPag->feemdp ), DtoC( PasoPag->fevedp ), PasoPag->modp,;
                                     if( PasoPag->timodp== "N",Transform( PasoPag->vadp, cCanRedon ),Transform( PasoPag->vadpd, ccanredon2 )),;
                                     if( PasoPag->timodp== "N",Transform( PasoPag->vaasdp+PasoPag->vavudp, cCanRedon ),Transform( PasoPag->vaasdpd+PasoPag->vavudpd, cCanRedon2 )),;
                                     if( PasoPag->timodp== "N",Transform( PasoPag->vasadp-PasoPag->vavudp, cCanRedon ),Transform( PasoPag->vasadpd-PasoPag->vavudpd, cCanRedon2 )),;
                                     pasopag->empresa," ",pasopag->RefAnti}},;
                                     oDlg, ;
                                     {"Lin","TD","Numero","F.Emision","F.Vencim.","Mon", "Monto ","Asignado ","Saldo ","ERP.","*","Referencia"},;
                                     {25,30, 72, 72, 72, 25, 93, 93, 93,40,10,300},,,,,,,,,,,, .F.,,,,, )
oLbx2:aJustify   := {.t.,.f.,.f.,.f.,.f.,.f.,.t.,.t.,.t.,.f.,.f.,.f.}
oLbx2:oHScroll   := NIL
oLbx2:lCellStyle := .t.
oLbx2:bLostFocus := {|| DejaFoco(oLbx2) }
oLbx2:lMChange   := .f.
oLbx2:bKeyDown   := {|nKey| If( nKey == VK_RETURN, Eval(oLbx2:bLDblClick) , NIL) }
oLbx2:bLDblClick := {|| VenPagos22( oDlg, tabpri, apagos, oLbx2, oLbx3, abSumas, nTasaActual, oLbx1, oBtnGrabar ) }

oLbx2:bChange    := {|| If( Empty( PasoPag->refanti) .AND. Empty( pasopag->docrelant) ,;
                            oReferencia:Hide(),;
                            ( oReferencia:SetText( PasoPag->refanti + " " + pasopag->docrelant ),;
                              oReferencia:Refresh(),;
                              oReferencia:Show() ) ) }

oLbx2:bGotFocus  := {|| Tomafoco(oLbx2),;
                        If( VeSiHayReg("PASOPAG") == 0,;
                            ( aPagos[mayorlinpa] := 1,;
                              Eval( bPasoAdd ),;
                              oLbx2:Upstable(),;
                              oLbx2:nColAct := 2 ),;
                            NIL ) }

oLbx2:bFlecha := {|| If( PasoPag->( LastRec() ) == PasoPag->( RecNo() ) .and. !Empty( PasoPag->TiDp ) .and. !Empty( PasoPag->VaDp ),;
                            ( oLbx2:Cargo := PasoPag->( RecNo() ),;
                              ++aPagos[mayorlinpa],;
                              Eval( bPasoAdd ),;
                              Eval( oLbx2:bGoTop ),;
                              PasoPag->( DbGoto( oLbx2:Cargo ) ),;
                              oLbx2:Refresh(),;
                              oLbx2:nColAct := 2),;
                             NIL )  }

oLbx2:bDelete := {|| Borra22( tabpri, apagos ),;
                     oLbx2:Hide(),;
                     PasoPag->( dbdelete(), dbPack() ),;
                     IIF(VeSiHayReg("pasopag") == 0,(aPagos[mayorlinpa]:= 1,Eval(bPasoAdd)),NIL ),;
                     bTotales2( oLbx3, abSumas ),;
                     oLbx3:Hide(),oLbx3:Refresh(),oLbx3:Show(),oLbx3:nColAct := 11,;
                     bTotales( oLbx2, abSumas ),oLbx2:Refresh(),oLbx2:Show(),oLbx2:nColAct := 2,oLbx2:SetFocus() }

Select PASODEU
oLbx3 := TBCRam():ReDefine( 153,,oDlg,,,,,,,,,,,,,, .F.,,,,, )
oLbx3:lNoHScroll := .T.
oLbx3:oHScroll   := NIL
oLbx3:lCellStyle := .T.
oLbx3:bGotFocus  := {|| oLbx3:nColAct := 11, TomaFoco(oLbx3) }
oLbx3:bLostFocus := {|| DejaFoco(oLbx3) }
oLbx3:bKeyDown   := {|nKey| If( nKey == VK_RETURN, VentaPa3(ownd,tabpri,apagos,oLbx3, oLbx2, oDlg, abSumas, .F., If( nCritEval==2,.t.,.f.),0 ), NIL ) }
oLbx3:bLDblClick := {|| VentaPa3(ownd,tabpri,apagos,oLbx3, oLbx2, oDlg, abSumas, .T., If( nCritEval==2,.t.,.f.),1 ) }
oLbx3:lMChange   := .F.
oLbx3:bChange    := {|| oSayOtraEmpresa:Refresh() }

ADD COLUMN TO BROWSE oLbx3 DATA ;
           (ubica("pasodeut",PasoDeu->nreg),;
           pasodeu->valdocub  := pasodeut->valdocu,;
           pasodeu->valdocudb := pasodeut->valdocud,;
           pasodeu->saldoantb := pasodeut->saldoant,;
           pasodeu->saldoactb := pasodeut->saldoact,;
           pasodeu->saldoantdb:= pasodeut->saldoantd,;
           pasodeu->saldoactdb:= pasodeut->saldoactd,;
           PasoDeu->linea) HEADER "Lin"     SIZE 25 RIGHT
ADD COLUMN TO BROWSE oLbx3 DATA PasoDeu->MARCADO HEADER "*" SIZE 10
ADD COLUMN TO BROWSE oLbx3 DATA Pasodeu->empresa  HEADER "Emp."  SIZE 30
ADD COLUMN TO BROWSE oLbx3 DATA If( PasoDeu->tipolin=="P",PasoDeu->tido,"   ") HEADER "DP"       SIZE 30
ADD COLUMN TO BROWSE oLbx3 DATA If( PasoDeu->tipolin=="P",PasoDeu->nudo,"   ") HEADER "Numero "  SIZE 68

ADD COLUMN TO BROWSE oLbx3 DATA PasoDeu->SuEndO HEADER "S.Ent" SIZE 40

ADD COLUMN TO BROWSE oLbx3 DATA If( PasoDeu->tipolin=="P",DtoC( PasoDeu->FeUlVedo),Spac(8) ) HEADER "F.Venc. " SIZE 68
ADD COLUMN TO BROWSE oLbx3 DATA If( PasoDeu->tipolin=="P",PASODEU->MODO,Spac(3) )  HEADER "Mon."    SIZE 25
ADD COLUMN TO BROWSE oLbx3 DATA If( PasoDeu->tipolin== "P",;
           iif(pasodeu->timodo== "N",Transform( PasoDeu->valdocub ,cCanRedon),Transform( PasoDeu->valdocudb ,cCanRedon2)), Spac(10) )   HEADER "Valor_Doc "  SIZE 91 RIGHT // FOOTER "Totales..."

ADD COLUMN TO BROWSE oLbx3 DATA If( PasoDeu->tipolin== "P",;
    Transform( PasoDeu->saldoantb,cCanRedon),Spac(10));
    HEADER "Saldo_Ant_"+smn+" " SIZE 91 RIGHT

ADD COLUMN TO BROWSE oLbx3 DATA Transform( PasoDeu->Abono,cCanRedon);
    HEADER "Abono_"+smn+" "      SIZE 91 RIGHT

ADD COLUMN TO BROWSE oLbx3 DATA If(PasoDeu->ultlin,Transform(PasoDeu->saldoactb,cCanRedon),"..........");
    HEADER "Saldo_Act_"+smn+" " SIZE 91 RIGHT ;

ADD COLUMN TO BROWSE oLbx3 DATA If(PasoDeu->tipolin== "P",;
    Transform( PasoDeu->saldoantdb,ccanredon2), Spac(10));
    HEADER "Saldo_Ant_"+sme+" " SIZE 91 RIGHT

ADD COLUMN TO BROWSE oLbx3 DATA Transform( PasoDeu->AbonoD,cCanRedon2);
    HEADER "Abono_"+sme+" "      SIZE 91 RIGHT

ADD COLUMN TO BROWSE oLbx3 DATA If(PasoDeu->ultlin,Transform(PasoDeu->saldoactDb,cCanRedon2),"..........");
    HEADER "Saldo_Act_"+sme+" " SIZE 91 RIGHT

ADD COLUMN TO BROWSE oLbx3 DATA If( Left( PasoDeu->TiDo,2)$"CH_LT",PasoDeu->NuCuDp," ")  HEADER "Nro.Doc. "  SIZE 68

oLbx3:aActions := Array( 16 )
oLbx3:aActions[02] := {|| PagoAcciones( oDlg, oLbx3, 02) }  // "*"  marcar todo el set de documentos?

ta:=tbram():redefine(154,;
    {|| {tmonfe[ta:nat,1],str(tmonfe[ta:nat,2],10,2),tmonfe[ta:nat,3] }},;
    oDlg, {"Mon ","Tasa","Nombre Mon."},;
    {40,80,150},,,, ,,,,,,,,.F.,,,,,)
ta:ajustify:={.f.,.t.,.f.}
ta:setarray(tmonfe)
ta:ohscroll:= NIL

REDEFINE SAY oSayOtraEmpresa PROMPT If( PasoDeu->endo == aPagos[adocumento][1,1], "", BuscaNombre(PasoDeu->endo,PasoDeu->suendo) ) ID 262 Of oDlg COLOR CLR_RED

REDEFINE CHECKBOX oCriterio VAR lCriterio ID 64 of odlg;
         ON CLICK ( nCriterio := If( lCriterio, 2, 1 ),;
                    PorEmpresa(tabpri,apagos, oLbx1, oLbx2, oLbx3, oDlg, .T., abSumas, ncriterio,verendosos, If( nCritEval==2,.t.,.f.) ) )

REDEFINE CHECKBOX oChkSucursal VAR lSoloSucursal ID 60 Of oDlg ON CLICK Eval( oBtnCancelar:bAction )

REDEFINE BUTTON oBtnVolver   ID 150 Of oDlg ACTION oDlg:End() CANCEL
oBtnVolver:cToolTip := "Volver a pantalla anterior"

REDEFINE BUTTON oBtnGrabar   ID 180 Of oDlg ;
      ACTION ( IIF(PIDEREFANTr3c(apagos[ndedocus],"PASOPAG", oDlg,tabpri),;
              (aPagos[tdpaim] := GrabaPagosr3c(odlg,tabpri,apagos,apagos[ndedocus] ),;
              lAsigFech := .T.,;
              oAsignaFecha:Refresh(),;
              SysRefresh(),;
              nSegundo := Seconds(),;
              If( len(aPagos[tdpaim]) > 0,;
                  AEval( aPagos[tdpaim], {|x| PreImpri2( oDlg, TabPri, x, .T., NIL, nSegundo ) } ),;
                  NIL ),;
              If( MsgYesNo( "Desea Imprimir Comprobante de Pagos","Atención" ),;
                      ImprimePagor3c( TabPri, PasoEn->Koen ),;
                  NIL ),;
              (apagos[tsaldoant] := 0, apagos[tabono] := 0, apagos[tsaldoact] := 0),;
              (apagos[tvadp] := 0, apagos[tvaasdp] := 0, apagos[tvasadp] := 0),;
              (apagos[tsaldoantd] := 0, apagos[tabonod] := 0, apagos[tsaldoactd] := 0),;
              (apagos[tvadpd] := 0, apagos[tvaasdpd] := 0, apagos[tvasadpd] := 0),;
              PasoEn->(dbzap()),;
              PasoDeu->(dbzap()),;
              PasoPag->(dbzap()),;
              aPagos[adocumento] := {{Spac(13),Spac(50),tabpri[sucursal],tabpri[caja],tabpri[cusua]}},;
              oLbx1:Refresh(),;
              bTotales( oLbx2, abSumas ),;
              oLbx2:Refresh(),;
              bTotales2( oLbx3, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] ),;
              oLbx3:Refresh()),NIL))
oBtnGrabar:cToolTip   := "Grabar los movimientos de pago"

REDEFINE BUTTON oBtnCancelar ID 310 Of oDlg ;
         ACTION ( lAsigFech := .T.,;
                  oAsignaFecha:Refresh(),;
                  SysRefresh(),;
                  Tone( 320,1 ), Tone( 220,1 ), Tone( 120,1 ),;
                  (apagos[tsaldoant] := 0, apagos[tabono] := 0, apagos[tsaldoact] := 0),;
                  (apagos[tvadp] := 0, apagos[tvaasdp] := 0, apagos[tvasadp] := 0),;
                  (apagos[tsaldoantd] := 0, apagos[tabonod] := 0, apagos[tsaldoactd] := 0),;
                  (apagos[tvadpd] := 0, apagos[tvaasdpd] := 0, apagos[tvasadpd] := 0),;
                  PasoEn->(dbzap()),;
                  PasoDeu->(dbzap()),;
                  PasoPag->(dbzap()),;
                  aPagos[adocumento] := {{Spac(13),Spac(50),tabpri[sucursal],tabpri[caja],tabpri[cusua]}},;
                  oLbx1:Refresh(),;
                  bTotales( oLbx2, abSumas ),;
                  oLbx2:Refresh(),;
                  bTotales2( oLbx3, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] ),;
                  oLbx3:Refresh() )

oBtnCancelar:cToolTip := "Limpiar todo y reiniciar el proceso"

REDEFINE BUTTON oBtnBuscar   ID 200 OF oDlg ;
         ACTION ( aResultado := BuscarSQL( oDlg, aMaeEn, {"MAEEN.KOEN","MAEEN.NOKOEN"},{13,30},,;
                                           If( tabpri[sistema]=="ventas"," MAEEN.TIEN IN ( 'C','A' )", " MAEEN.TIEN IN ( 'P','A' )" ) ),;
                  If( !Empty( aResultado ),;
                      ( aPagos[adocumento][1,1] := aResultado[1],;
                        oLbx1:nColAct := 1,;
                        oLbx1:Refresh(),;
                        PedirEntidad(tabpri,apagos, oLbx1, oLbx2, oLbx3, oDlg, .T., abSumas, ncriterio,verendosos, If( nCritEval==2,.t.,.f.), lSoloSucursal, oBtnCancelar ),;
                        oLbx2:Hide(),;
                        bTotales( oLbx2, abSumas ),;
                        oLbx2:Refresh(),;
                        oLbx2:Show(),;
                        oLbx2:Setfocus(),;
                        oLbx2:nColAct := 2,;
                        oLbx3:Hide(),;
                        bTotales2( oLbx3, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] ),;
                        oLbx3:Refresh(),;
                        oLbx3:Show(),;
                        oLbx3:nColAct := 11),;
                      NIL ) )
oBtnBuscar:cToolTip   := "Buscar una entidad..."

REDEFINE SAY o58 prompt ctitulo   ID 58 of odlg

REDEFINE BUTTON  l188 ID 1188 Of oDlg ;
         ACTION If( CamMoEsCta(odlg, tabpri,apagos,olbx3,oLbx2),;
                    ( If( apagos[enpesos],;
                          ctitulo:= " Nacional  " + DtoC(TabPri[fechtamo]),;
                          ctitulo:= " "+ tabpri[quemonedoc] + "  " + DtoC(TabPri[fechtamo]) ),;
                      o58:refresh(),;
                      bTotales2( oLbx3, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] ),;
                      olbx2:gobottom(),;
                      olbx2:refresh(),;
                      olbx3:refresh() ),;
                    NIL)
l188:ctooltip := "Cambiar moneda del estado de cuenta"

REDEFINE BUTTON l241 ID 241 Of oDlg ;
         ACTION ( nuevafech := SelectTasa(ODLG,TABPRI),;
                  if(!empty(nuevafech),;
                     (tmonfe:= tasamone(nil,nuevafech,.t.,3),;
                      tabpri[fechtamo]:= nuevafech,;
                      tabpri[tamona]:= tasamone(tabpri[quemonedoc],tabpri[fechtamo],.f.,4),;
                      ta:setarray(tmonfe),;
                      ta:gotop(),;
                      ta:refresh(),;
                      cMaestro := aPagos[adocumento][1,1],;
                      Eval( oBtnCancelar:bAction ),;
                      aPagos[adocumento][1,1] := cMaestro,;
                      PedirEntidad(tabpri,apagos, oLbx1, oLbx2, oLbx3, oDlg,.T., abSumas, ncriterio,verendosos, If( nCritEval==2,.t.,.f.), lSoloSucursal, oBtnCancelar )),;
                      nil ))
l241:cToolTip := "Seleccionar tasa de cambio según fecha "

ACTIVATE DIALOG oDlg CENTER ON INIT (o58:refresh(),oLbx1:SetFocus())
CierraBorra( "PasoPag"  ) ; CierraBorra( "PasoDeu"  ) ; CierraBorra( "PasoDeut" ) ; CierraBorra( "PasoEn"   )

SetKey( 114, NIL ) ; SetKey( 115, NIL )
dev:= { lGrabar , apagos[ndedocus],apagos[tvadp],apagos[tvaasdp]  }
RETURN dev
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
Static Function PagoAcciones( oDlg, oLbx, nPos )
Local nRecno := 0
If nPos == 2
   PasoDeu->( dbGoTop() )
   While PasoDeu->( !Eof() )
      iif(PASODEU->MARCADO == " ",PASODEU->MARCADO:= "S",PASODEU->MARCADO:= " " )
      PasoDeu->( dbSkip() )
   EndDo
   PasoDeu->(dbGoTop())
   oLbx:lHitTop := .F. ; oLbx:GoTop() ;   oLbx:Refresh() ;  oLbx:Setfocus()
EndIf

Return NIL
//---------------------------------------------------------------------------------------------------------------------------------
Static Function BuscaNombre( cEndo, cSuEndo )
Local dev := ""
Local TMaes := {}

If SeekSQL("MAEEN",TMaes,{"KOEN","TIPOSUC"},{cEndo,"P"},"NOKOEN")
   dev := AllTrim(cEndo)+" "+AllTrim(Vcc(TMaes,"NOKOEN"))
EndIf

Return dev
******************************************************************************************************
Static Function mirar()
if msgyesno("MIRA pasodeu")
   pasodeu->(browse())
endif
if msgyesno("MIRA pasopag")
   pasopag->(browse())
endif
return nil
******************************************************************************************************
Static Function Porempresa(tabpri,apagos,oLbx,oLbxPagos,oLbxDeuda,oDlg,lForzar,abSumas, ncriterio,verendosos, lTasaDoc )
IF !empty(pasoen->koen)
   apagos[tsaldoant] := 0
   apagos[tabono]    := 0
   apagos[tsaldoact] := 0
   apagos[tvadp]     := 0
   apagos[tvaasdp]   := 0
   apagos[tvasadp]   := 0

   apagos[tsaldoantd] := 0
   apagos[tabonod]    := 0
   apagos[tsaldoactd] := 0
   apagos[tvadpd]     := 0
   apagos[tvaasdpd]   := 0
   apagos[tvasadpd]   := 0

   PasoDeu->(dbzap())
   PasoPag->(dbzap())

   // DE LA ENTIDAD INDICADA EN PASOEN  (libgest)
   if ncriterio <> 1
      verendosos:= .f.
   endif
   tasamone(nil,tabpri[fechtamo],.t.,5)
   TraeDeuda(oDlg,tabpri,tabpri[fechtamo],.T.,ncriterio,,verendosos,,tabpri[quemonedoc])

   apagos[ndedocus]:=0
   PasoDeuT->( dbgotop() )
   WHILE PasoDeuT->(!eof())
      apagos[tsaldoant] += PasoDeuT->saldoant
      apagos[tabono]    += PasoDeuT->abono
      apagos[tsaldoact] += PasoDeuT->saldoact

      apagos[tsaldoantd] += PasoDeuT->saldoantd
      apagos[tabonod]    += PasoDeuT->abonod
      apagos[tsaldoactd] += PasoDeuT->saldoactd

      apagos[ndedocus]++
      PasoDeuT->(dbskip())
   ENDDO
   SysRefresh()

   PasoDeu->(dbgotop())
   PasoPag->(dbgotop())

   aPagos[mayorlinpa]:=0
   WHILE PasoPag->(!eof())
      apagos[tvadp]    += PasoPag->vadp
      apagos[tvaasdp]  += PasoPag->vaasdp + PasoPag->vavudp
      apagos[tvasadp]  += PasoPag->vasadp - PasoPag->vavudp

      apagos[tvadpd]    += PasoPag->vadpd
      apagos[tvaasdpd]  += PasoPag->vaasdpd + PasoPag->vavudpd
      apagos[tvasadpd]  += PasoPag->vasadpd - PasoPag->vavudpd

      aPagos[mayorlinpa]++
      IF !PasoPag->nuevop
         apagos[ndedocus]++
      ENDIF
      PasoPag->(dbskip())
   ENDDO
   SysRefresh()

   aPagos[adocumento][1,1] := pasoen->koen
   aPagos[adocumento][1,2] := PasoEn->NoKoEn
   oLbx:Refresh()

   oLbxPagos:Hide()
   PasoPag->( dbGoTop() )
   oLbxPagos:UpStable()
   bTotales( oLbxPagos, abSumas )
   oLbxPagos:Refresh()
   oLbxPagos:Show()
   oLbxPagos:nColAct := 2

   oLbxDeuda:Hide()
   PasoDeu->( dbGoTop() )
   oLbxDeuda:UpStable()
   bTotales2( oLbxDeuda, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] )
   oLbxDeuda:Refresh()
   oLbxDeuda:Show()
   oLbxDeuda:nColAct := 3
ENDIF

return nil
******************************************************************************************************
Static Function CamMoEsCta( oDlg, tabpri, apagos, olbx3, oLbx2 )
LOCAL DEV:= .F.
local tabla,hstmt,lhaydatos,tmaes,opcion,xx

IF !tabpri[doblemo]
   MsgStop("Esta versión no es Multimoneda moneda","ERROR")
ELSE
   if apagos[enpesos]
      tabla:={}
      Tmaes := {} ; hstmt:= 0 ; lhaydatos:= .f.
      hStmt := CrearCursor( TMaes, "SELECT * FROM TABMO  WITH ( NOLOCK ) WHERE TIMO <> 'N' ORDER BY NOKOMO ",@lhaydatos )
      While lhaydatos
         AADD(TABLA,vcc(tmaes,"Komo") + " " + vcc(tmaes,"nokomo") )
         If SkipSQL( HStmt, TMaes ) == 0
            EXIT
         EndIf
      EndDo
      LiberaCursor( hStmt )
      opcion:= opciones(odlg,tabla,"Seleccione tipo de moneda de pago")
      if opcion <> 0
         xx:=tasamone(left(tabla[opcion],3),tabpri[fechtamo],.f.,6)
         if xx > 0
            dev:= .t.
            tabpri[tamona]     := xx
            apagos[enpesos]    := .f.
            tabpri[quemonedoc] := left(tabla[opcion],3)
         else
            dev:= .f.
         endif
      endif
   else
      if msgyesno("Cambia a moneda nacional ?" ,"ATENCION")
         dev:= .t.
         apagos[enpesos] := .t.
      endif
   endif
endif
if dev
   PasoPag->(dbgotop())
   while PasoPag->(!eof())
       if PasoPag->vadp == 0 .and. round( PasoPag->vadpd,2) == 0.00
          if apagos[enpesos]
             PasoPag->modp  := tabpri[monenac]
             PasoPag->timodp:= "N"
             PasoPag->TAmodp:= TABPRI[tamona]
          else
             PasoPag->modp  := tabpri[quemonedoc]
             PasoPag->timodp:= "E"
             PasoPag->TAmodp:= tabpri[tamona]
          endif
       endif
       PasoPag->(dbskip())
   enddo
   OLBX3:SwitchCols(10, 13)
   OLBX3:SwitchCols(11, 14)
   OLBX3:SwitchCols(12, 15)
endif
oLbx2:Refresh() ; oLbx3:Refresh()
return dev
//------------------------------------------------------------------------------------
Static Function VentaPa3(ownd,tabpri,apagos,oLbx, oLbxPagos, oDlg, abSumas, lForzar,ltasadoc,NMARCAR )
Local xEd, xEd2, Lugar, Llave, tabcrupag, dife, repetir,difed, aux
local bnltamodo,bnltamona,xxxx, cSuma, cPermisos, nPermisos, cWhere
Local aOpciones := {}
Local i    := 0
Local lOk  := .T.
Local xred := 0
Local nColDeDatos := 11
Local TMaes := {}
Local ccanredon
Local lCruceAutorizado := .F.

MEMVAR DEF_REDON, ARROBAE
MEMVAR lExistePermiFecha

DEFAULT lForzar := .F.
DEFAULT NMARCAR:= 0
repetir := .f.
ccanredon := ARROBAE + " 99999999999.99"

xxxx := oLbx:nColAct

IF oLbx:nColAct <> 11 .AND. NMARCAR == 1
   TONE(120,1)
   IF PASODEU->MARCADO == " "
      PASODEU->MARCADO:= "S"
   ELSE
      PASODEU->MARCADO:= " "
   ENDIF
   OLBX:REFRESH()
ENDIF

oLbx:nColAct := xxxx
// SIEMPRE AHORA CON TASA DEL DIA
bnltamodo:= {|| pasodeu->tamodo}
bnltamona:= {|| tasamone(pasodeu->modo,tabpri[fechtamo],.f.,7) }

Ubica("pasodeut",PasoDeu->nreg)

If !Empty( aPagos[adocumento][1,1] ) .and. ( GetAsyncKey( 13 ) .or. lForzar )

   oLbx:nColAct := xxxx

   If PasoPag->TiDp+PasoPag->NuDp == PasoDeu->TiDo+PasoDeu->NuDo .and. PasoPag->TiDp $ "ATB_"   //  jgv 27/10/2011
      MsgStop("La asignación que intenta realizar no es válida"+CRLF+;
              "( el documento no puede pagarse a si mismo )","ATENCION")

   ElseIf PasoDeu->TiDo $ "ATB_PTB_DEP"   //  jgv 28/10/2011
      MsgStop("La asignación que intenta realizar no es válida"+CRLF+;
              "( transferencias bancarias o depósitos no pueden pagarse )","ATENCION")

   Else

      Do Case
         Case oLbx:nColAct == nColDeDatos .and. ( (pasopag->timodp == "N" .and. !apagos[enpesos]) .or. (pasopag->timodp <> "N" .and.  apagos[enpesos]) )
              MsgStop("Debe expresar la moneda de la cuenta "+CRLF+;
                      "de acuerdo a la moneda del documento de pago","ATENCION")

         Case apagos[enpesos] .and. oLbx:nColAct == nColDeDatos .and. ( PasoDeu->linea == 0 .or. PasoDeu->linea == PasoPag->linea)

              * NO PERMITIR PAGOS CON VENC. SUPERIOR A ULT.VENC.DOCUM  28/07/2009  jgv
              If PasoPag->Fevedp > PasoDeu->FeUlVeDo .and. lExistePermiFecha
                 MsgStop("La fecha de vencimiento del documento de pago no debe superar a"+CRLF+;
                         "la fecha del último vencimiento del documento a pagar (restricciones)","ATENCION")
                 lOk := .F.
              EndIf

              If lOk
                 lOk := .F.
                 If PasoDeu->linea == 0
                    xEd := MIN(( PasoPag->vasadp-PasoPag->vavudp),PasoDeuT->saldoact)
                    aux := xEd
                    If oLbx:lEditCol( oLbx:nColAct,@xEd,ccanredon,, CLR_YELLOW,CLR_BLUE )
                       If xEd >= 0 .and. xEd <= aux
                          lOk := .T.
                       EndIf
                    EndIf
                 Else
                    xEd := PasoDeu->abono
                    aux := xEd
                    If oLbx:lEditCol( oLbx:nColAct,@xEd,ccanredon,,CLR_YELLOW,CLR_BLUE )
                       If xEd >= 0 .and. xEd - PasoDeu->abono <= PasoPag->vasadp .and. xEd <= PasoDeuT->SALDOACT+AUX
                          lOk := .T.
                       EndIf
                    EndIf
                 EndIf
                 If PasoPag->TiDp == "CRV" .and. lOk .and. xEd <> PasoPag->VaDp
                    MsgInfo("Debe asignar a una sola factura y por el total","ATENCION")
                    lOk := .F.
                 EndIf
              EndIf

              IF LOK
                 If PasoPag->TiDp $ "RIV_RBV_RGV_RIC_RBC_RGC"
                    IF  xEd <> PasoPag->VaDp
                        lOk := .F.
                        MsgInfo("Debe asignar a una sola factura y por el total","ATENCION")
                    ELSEIf xEd <> VALORRETARG(Pasopag->tidp)
                        lOk := .F.
                        MsgInfo("Debe corresponder al valor oficial de retención","ATENCION")
                    ENDIF
                 ENDIF
              ENDIF

              If lOk
                 //--- Documento con permiso para pago, si no tiene los permisos entregados : no se paga !!   jgv 16/08/2008
                 TMaes := {}
                 If SeekSQL("TABTIDO",TMaes,{"TIDO"},{PasoDeu->tido},"PERMISOS")
                    nPermisos := Vcc(TMaes,"PERMISOS")
                    If !Empty( nPermisos )
                       cSuma     := "(SELECT COALESCE(PERMISOS,0) FROM TABTIDO WITH (NOLOCK) WHERE TIDO='"+PasoDeu->tido+"')"
                       cPermisos := "(SELECT count(*) FROM TABVISBUE WITH (NOLOCK) WHERE ARCHIRST='MAEEDO' AND IDRST="+nacsb(PasoDeu->idarchivo)+" ) "
                       cWhere    := " WHERE ( "+cSuma+"=0 OR ("+cSuma+"="+cPermisos+") )"
                       If CuentaRegSQL( "TABVISBUE", cWhere ) < nPermisos
                          lOk := .F.
                          MsgStop("El documento que desea pagar no tiene los Vo.Bo. suficientes"+CRLF+;
                                  "Otorge o solicite los permisos necesarios y vuelva a intentar el pago","ATENCION : FALTAN Vo.Bo.")
                       EndIf
                    EndIf
                 EndIf
              EndIf

              If lOk
                 dife  := xEd - PasoDeu->abono
                 IF Pasodeu->timodo == "N"
                    difed := round(xEd/eval(bnltamodo),2) - PasoDeu->abonod
                 else
                    difed := round(xEd/eval(bnltamona),2) - PasoDeu->abonod
                 endif
                 PasoDeu->abono   := xEd
                 IF Pasodeu->timodo == "N"
                    PasoDeu->abonod  := round(xEd/eval(bnltamodo),2)
                    pasodeu->tcasig  := Eval(Bnltamodo)
                 else
                    PasoDeu->abonod  := round(xEd/eval(bnltamona),2)
                    pasodeu->tcasig  := eval(bnltamona)
                 endif

                 PasoDeuT->abono    := PasoDeuT->abono + dife
                 PasoDeuT->saldoact := ( PasoDeuT->saldoant-PasoDeuT->abono)
                 PasoPag->vaasdp    := PasoPag->vaasdp + dife
                 PasoPag->vasadp    := ( PasoPag->vadp - PasoPag->vaasdp )

                 PasoDeuT->abonod    := PasoDeuT->abonod + difed
                 PasoDeuT->saldoactd := ( PasoDeuT->saldoantd-PasoDeuT->abonod)

                 PasoPag->vaasdpd    := PasoPag->vaasdpd + difed
                 PasoPag->vasadpd    := ( PasoPag->vadpd - PasoPag->vaasdpd )

                 // documento debe darse por cancelado segun su moneda base
                 if PasoDeu->timodo == "N"
                    If PasoDeu->linea == 0 .and. PasoDeuT->saldoact <> 0
                       repetir:= .t.
                    EndIf
                 else
                    If PasoDeu->linea == 0 .and. PasoDeuT->saldoactd <> 0
                       repetir:= .t.
                    EndIf
                 endif

                 PasoDeu->linea   := PasoPag->linea
                 PasoDeu->tidp    := PasoPag->tidp

                 apagos[tvaasdp]   += dife
                 apagos[tvasadp]   -= dife
                 apagos[tabono]    += dife
                 apagos[tsaldoact] := apagos[tsaldoant] - apagos[tabono]

                 apagos[tvaasdpd]   += difed
                 apagos[tvasadpd]   -= difed
                 apagos[tabonod]    += difed
                 apagos[tsaldoactd] := apagos[tsaldoantd] - apagos[tabonod]

                 bTotales( oLbxPagos, abSumas )
                 oLbxPagos:Refresh()

                 Ventapa31(odlg,tabpri,apagos, oLbx, abSumas )

              EndIf
              bTotales2( oLbx, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] )
              oLbx:Refresh()

         Case !apagos[enpesos] .and. oLbx:nColAct == nColDeDatos .and. ( PasoDeu->linea == 0 .or. PasoDeu->linea == PasoPag->linea) .and. pasodeu->timodo <> "N" .and. pasodeu->modo <> pasopag->modp
              MsgInfo("Asignación no permitida","ATENCION")

         Case !apagos[enpesos] .and. oLbx:nColAct == nColDeDatos .and. ( PasoDeu->linea == 0 .or. PasoDeu->linea == PasoPag->linea)

              lOk := .T.
              * NO PERMITIR PAGOS CON VENC. SUPERIOR A ULT.VENC.DOCUM  28/07/2009  jgv
              If PasoPag->Fevedp > PasoDeu->FeUlVeDo .and. lExistePermiFecha
                 MsgStop("La fecha de vencimiento del documento de pago no debe superar"+CRLF+;
                         "la fecha del último vencimiento del documento a pagar (restricciones)","ATENCION")
                 lOk := .F.
              EndIf

              If lOk
                 lOk := .F.
                 If PasoDeu->linea == 0
                    xEd := MIN(( PasoPag->vasadpd-PasoPag->vavudpd),PasoDeuT->saldoactd)
                    aux := xEd
                    If oLbx:lEditCol( oLbx:nColAct,@xEd,ccanredon,, CLR_YELLOW,CLR_BLUE )
                       If xEd >= 0 .and. xEd <= aux
                          lOk := .T.
                       EndIf
                    EndIf
                 Else
                    xEd := PasoDeu->abonod
                    aux := xEd
                    If oLbx:lEditCol( oLbx:nColAct,@xEd,ccanredon,,CLR_YELLOW,CLR_BLUE )
                       If xEd >= 0 .and. xEd - PasoDeu->abonod <= PasoPag->vasadpd .and. xEd <= PasoDeuT->SALDOACTd+AUX
                          lOk := .T.
                       EndIf
                    EndIf
                 EndIf
              EndIf

              If lOk
                 difed := xEd - PasoDeu->abonod
                 dife  := round(xed*eval(bnltamoDO),DEF_REDON) - PasoDeu->abono
                 PasoDeu->abonod := xEd
                 PasoDeu->abono  := Round(xed*eval(bnltamoDO),DEF_REDON)
                 **pasodeu->tcasig  := eval(bnltamodo)  // activé esta opcion en lugar de la anterior, para anticipos falla la centralizacion   jgv 06/11/2012
                 pasodeu->tcasig  := pasopag->tamodp    // reactivada: RAM    jgv 23/01/2013

                 PasoDeuT->abonod   := PasoDeuT->abonod+ difed
                 PasoDeuT->saldoactd:= ( PasoDeuT->saldoantd-PasoDeuT->abonod)
                 PasoPag->vaasdpd   := PasoPag->vaasdpd + difed
                 PasoPag->vasadpd   := ( PasoPag->vadpd - PasoPag->vaasdpd )

                 PasoDeuT->abono    := PasoDeuT->abono + dife
                 PasoDeuT->saldoact := ( PasoDeuT->saldoant-PasoDeuT->abono)
                 PasoPag->vaasdp    := PasoPag->vaasdp + dife
                 PasoPag->vasadp    := ( PasoPag->vadp - PasoPag->vaasdp )

                 // PARA pagar EL redondeo de pesos
                 IF PasoDeuT->saldoactd == 0 .AND. PasoDeuT->saldoact <> 0
                    xred:= PasoDeuT->saldoact
                    PasoDeuT->saldoact:= 0
                    PasoDeu->abono  += xred
                    PasoDeuT->abono += xred
                    PasoPag->vadp   += xred
                    PasoPag->vaasdp += xred
                    PasoPag->vasadp := ( PasoPag->vadp - PasoPag->vaasdp )
                     dife += xred
                     tabpri[valpie ] += xred
                 ENDIF

                 // comentario el documento debe darse por  cancelado segun su moneda base
                 if PasoDeu->timodo == "N"
                    If PasoDeu->linea == 0 .and. PasoDeuT->saldoact <> 0
                       repetir:= .t.
                    EndIf
                 else
                    If PasoDeu->linea == 0 .and. PasoDeuT->saldoactd <> 0
                       repetir:= .t.
                    EndIf
                 endif

                 PasoDeu->linea     := PasoPag->linea
                 PasoDeu->tidp      := PasoPag->tidp

                 apagos[tvaasdpd]   += difed
                 apagos[tvasadpd]   -= difed
                 apagos[tabonod]    += difed
                 apagos[tsaldoactd] := apagos[tsaldoantd] - apagos[tabonod]

                 apagos[tvaasdp]    += dife
                 apagos[tvasadp]    -= dife
                 apagos[tabono]     += dife
                 apagos[tsaldoact]  := apagos[tsaldoant] - apagos[tabono]

                 bTotales( oLbxPagos, abSumas )
                 oLbxPagos:Refresh()

                 Ventapa31( oDlg, TabPri, aPagos, oLbx, abSumas )

              EndIf
              bTotales2( oLbx, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] )
              oLbx:Refresh()
      EndCase
   EndIf
EndIf
Return NIL
//----------------------------------------------------------------------------
Static Function Ventapa31(odlg,tabpri,apagos, oLbx, abSumas )
Local lugarin,abras,aux, i, tabtras
Local nReg := PasoDeu->( RecNo() )
PasoDeu->(dbgotop())
if PasoDeu->timodo == "N"
   While PasoDeu->(!Eof())
      ubica("pasodeut",PasoDeu->nreg)
      if PasoDeu->abono == 0
         PasoDeu->linea := 0
         PasoDeu->tidp  := "   "
      endif
      If ( PasoDeuT->saldoact == 0  .and. PasoDeu->abono == 0 .and. PasoDeu->tipolin <> "P" ) .OR.;
         ( PasoDeu->tipolin <> "P"  .and. PasoDeuT->saldoant == PasoDeuT->saldoact )
         aux := PasoDeu->ultlin
         PasoDeu->(dbdelete())
         PasoDeu->(dbskip(-1))
         if aux
            PasoDeu->ultlin:= aux
         endif
      else
         if ( PasoDeu->linea > 0 .AND. PasoDeu->ultlin) .and. PasoDeuT->saldoact > 0 .AND. PasoDeu->ABONO <> 0
            lugarin:= PasoDeu->(recno())
            tabtras:={}
            for i:= 1 to PasoDeu->( fcount() )
                aadd(tabtras, PasoDeu->( fieldget(i) ) )
            next
            PasoDeu->ultlin:= .f.
            PasoDeu->(dbappend() )
            for  i:= 1 to PasoDeu->( fcount() )
                 PasoDeu->( fieldput(i, tabtras[i]) )
            next i
            PasoDeu->linea:= 0
            PasoDeu->tidp := space(3)
            PasoDeu->tipolin:= "S"
            PasoDeu->abono   := 0
            PasoDeu->abonod  := 0  // comentario dudoso

            PasoDeu->(dbgoto(lugarin))
         endif
      endif
      PasoDeu->(dbskip())
   ENDDO
else
   While PasoDeu->(!Eof())
      ubica("pasodeut",PasoDeu->nreg)
      if PasoDeu->abonod == 0
         PasoDeu->linea := 0
         PasoDeu->tidp  := "   "
      endif
      If ( PasoDeuT->saldoactd == 0  .and. PasoDeu->abonod == 0 .and. PasoDeu->tipolin <> "P" ) .OR.;
         ( PasoDeu->tipolin <> "P"  .and. PasoDeuT->saldoantd == PasoDeuT->saldoactd )
         aux := PasoDeu->ultlin
         PasoDeu->(dbdelete())
         PasoDeu->(dbskip(-1))
         if aux
            PasoDeu->ultlin:= aux
         endif
      else
         if ( PasoDeu->linea > 0 .AND. PasoDeu->ultlin) .and.;
            PasoDeuT->saldoactd > 0 .AND. PasoDeu->ABONOd <> 0
            lugarin:= PasoDeu->(recno())
            tabtras:={}
            for i:= 1 to PasoDeu->( fcount() )
                aadd(tabtras, PasoDeu->( fieldget(i) ) )
            next
            PasoDeu->ultlin:= .f.
            PasoDeu->(dbappend() )
            for  i:= 1 to PasoDeu->( fcount() )
                 PasoDeu->( fieldput(i, tabtras[i]) )
            next i
            PasoDeu->linea:= 0
            PasoDeu->tidp := space(3)
            PasoDeu->tipolin:= "S"
            PasoDeu->abonod  := 0
            PasoDeu->abono   := 0  // comentario dudoso

            PasoDeu->(dbgoto(lugarin))
         endif
      endif
      PasoDeu->(dbskip())
   ENDDO
endif
SysRefresh()
PasoPag->elegido:= .f.
PasoDeu->( dbgoTo(nReg) )
bTotales2( oLbx, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] )
Return NIL
//-------------------------------------------------------------------------------------
Static Function Borra22(tabpri,apagos )
Local aux,borro
Local TMaes := {}
borro:= .f.
IF PasoPag->vaasdp == 0
   apagos[tvadp]   -= PasoPag->vadp
   apagos[tvaasdp] -= PasoPag->vaasdp - PasoPag->vavudp
   apagos[tvasadp] := apagos[tvadp] - apagos[tvaasdp]

   apagos[tvadpd]   -= PasoPag->vadpd
   apagos[tvaasdpd] -= PasoPag->vaasdpd - PasoPag->vavudpd
   apagos[tvasadpd] := apagos[tvadpd] - apagos[tvaasdpd]
Else
   apagos[tvadp]  := apagos[tvadp]   - PasoPag->vadp
   apagos[tvaasdp]:= apagos[tvaasdp] - PasoPag->vaasdp -PasoPag->vavudp
   apagos[tvasadp]:= apagos[tvadp]   - apagos[tvaasdp]

   apagos[tvadpd]  := apagos[tvadpd]   - PasoPag->vadpd
   apagos[tvaasdpd]:= apagos[tvaasdpd] - PasoPag->vaasdpd -PasoPag->vavudpd
   apagos[tvasadpd]:= apagos[tvadpd]   - apagos[tvaasdpd]

   PasoDeu->( dbgotop() )
   WHILE PasoDeu->(!Eof())
         ubica("pasodeut",PasoDeu->nreg)
         IF PasoDeu->linea == PasoPag->linea
            PasoDeuT->abono   -= PasoDeu->abono
            PasoDeuT->abonod  -= PasoDeu->abonod
            PasoDeuT->saldoact := PasoDeuT->saldoant - PasoDeuT->abono
            PasoDeuT->saldoactd:= PasoDeuT->saldoantd - PasoDeuT->abonod
            apagos[tabono]  -= PasoDeu->abono
            apagos[tabonod] -= PasoDeu->abonod
            apagos[tsaldoact]  := apagos[tsaldoant]  - apagos[tabono]
            apagos[tsaldoactd] := apagos[tsaldoantd] - apagos[tabonod]
            PasoDeu->abono := 0
            PasoDeu->abonod:= 0
            PasoDeu->linea:= 0
            PasoDeu->tidp:= space(3)
         endif
         IF PasoDeuT->saldoact  == 0  .and. PasoDeu->abono == 0 .and. ;
            PasoDeuT->saldoactd == 0  .and. PasoDeu->abonod == 0 .and. ;
            PasoDeu->tipolin <> "P" .or.;
            ( PasoDeu->tipolin <> "P" .and. PasoDeuT->saldoant==PasoDeuT->saldoact .and. PasoDeuT->saldoantd==PasoDeuT->saldoactd  )
            aux := PasoDeu->ultlin
            PasoDeu->( dbdelete() )
            PasoDeu->( dbskip(-1) )
            borro:= .t.
            if aux
               PasoDeu->ultlin := .T.
            Endif
         endif
         PasoDeu->( dbskip() )
   ENDDO
   if borro
      PasoDeu->(dbPack())
   endif
   PasoDeu->( dbgotop() )
   SysRefresh()
ENDIF
Return NIL
//-------------------------------------------------------------------------------------------------------------------
Static Function VenPagos22( oPadre, Tabpri, aPagos, oLbx, oLbxDeuda, abSumas, nTasaActual, oLbx1, oBtnGrabar )
Local Lugar, Llave, tabcrupag, tabcrulug, dife,difed,ccanredon
Local xEd, xEd2, opcion2, aDim, oMenu
Local aOpciones := {}
Local i := 0
Local nRegistro := 0
Local lOk := .F.
Local hStmt     := 0
Local lHayDatos := .F.
Local TMaeEdo   := {}
Local TMaes     := {}
Local tconfi    := {}
local opcion:= 0
LOCAL XLDEU,XLDEUT
Local TMaeVen := {}
Local aMaeVen := {}
Local aBitmap := {}
Local nSaldoVenc, oSaySuma, oDlg, oBtnSalir, oBtnAsignar, lAsignar
Local oLbxVen, repetir:= .f.
Local bnltamodo:= {|| pasodeu->tamodo }
Local bnltamona:= {|| tasamone(pasodeu->modo,tabpri[fechtamo],.f.,7) }
Local oCuotas, aVarCon, oInteres, oInter, oDInter, xxx, nIdMaeEdo, nIdMaeVen
Local nInteres := 1
Local Tabinter:= {space(13),space(50)}
Local oBasePag
Local lExisteFCT := .F.
Local nLugDeuda
Local aDocumentoPago := {}

MEMVAR DEF_REDON, ARROBAE, lRet, LASIGFECH
If DEF_REDON == 0 .AND. PasoPag->timodp == "N"
   cCanRedon  := ARROBAE + " 99999999999"
Else
   cCanRedon  := ARROBAE + " 9999999999.99"
EndIf

If !Empty( aPagos[adocumento][1,1] )
   Do Case
      Case oLbx:nColAct == 2 .and. empty( PasoPag->tidp )

           MENU oMenu POPUP
           For i := 1 To Len( apagos[tabdp] )
               MENUITEM apagos[tabdp][i] Of oMenu ACTION xEd := Left( oMenuItem:cPrompt , 3 )
           Next
           ENDMENU
           oMenu:Activate( 100, 74, oPadre )

           If !Empty( xEd ) .and. !RestriccionDePago( TabPri, xEd )
              PasoPag->TiDp  := xEd

              If PasoPag->tiDp $ "EFV_EFC"
                 oLbx:nColAct := 7
              Else
                 IF !(xED $ "DEP_ATB" )
                    IF(XED == "PTB",XED:= "CHC",NIL)
                    DatosDP( oPadre, TabPri, xEd, lRet )
                 else
                    TABPRI[sistema]:= "compras"
                    DatosDP( oPadre, TabPri, "CHC", lRet )
                    TABPRI[sistema]:= "ventas"
                 endif
                 If PasoPag->tidp $ "CHV_CHC_LTV_LTC_DEP_ATB_PTB"
                    oLbx:nColAct := 5
                 else
                    oLbx:nColAct := 7
                 endif
              EndIf
           EndIf
           bTotales( oLbx, abSumas )
           bTotales2( oLbxDeuda, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] )
           oLbxDeuda:Refresh()
           oLbxDeuda:nColAct := 9

      Case oLbx:nColAct == 4 .and. !Empty( PasoPag->tidp) .and.;  // Upper( PasoPag->tidp) == PasoPag->tidp .and.;    jgv  02/09/2006
           ( PasoPag->vadp == 0 .or. PasoPag->vadp == PasoPag->vasadp ) .and. ConPermi( oPadre, TabPri, TabPri[cusua], "TO000882" )
           xEd := PasoPag->feemdp
           xEd2:= xEd
           If oLbx:lEditCol( oLbx:nColAct,@xEd,,,CLR_YELLOW,CLR_BLUE )
              If !Empty( xEd ) .and. xEd <= PasoPag->fevedp .and. topefechas( oPadre, tabpri, xEd, PasoPag->tidp, "emi")
                 If Left( PasoPag->tidp,2) == "EF" .or. Empty( PasoPag->fevedp )
                    PasoPag->feemdp:= xEd
                    If left( PasoPag->tidp,2) == "EF"
                       PasoPag->fevedp:= xEd
                    EndIf
                    oLbx:nColAct := 5
                 Else
                    * revisar si se cumple cantidad maxima de dias al ultimo venc. por modalidad  29/05/2009  jgv
                    If !Empty(TabPri[diasmaxpagos]) .and. PasoPag->fevedp-xEd > TabPri[diasmaxpagos]
                       MsgStop("Se está superando la cantidad máxima de días al último vencimiento"+CRLF+;
                               "indicada en la modalidad ( "+nacsb(TabPri[diasmaxpagos])+" dias max.)","ATENCION")
                    * revisar si se cumple cantidad maxima de dias al ultimo venc. por entidad 27/07/2009  jgv
                    ElseIf PasoEn->VALIVENPAG .and. PasoPag->fevedp-xEd > PasoEN->DiPrVe
                       MsgStop("Se está superando la cantidad máxima de días al último vencimiento"+CRLF+;
                               "indicada en la ficha de la entidad ( "+nacsb(PasoEN->DiPrVe)+" dias max.)","ATENCION")
                    Else
                       PasoPag->feemdp:= xEd
                       If left( PasoPag->tidp,2) == "EF"
                          PasoPag->fevedp:= xEd
                       EndIf
                       oLbx:nColAct := 5
                    EndIf
                 EndIf
              EndIf
           EndIf

      Case oLbx:nColAct == 5  .and. !Empty(PasoPag->tidp) .and. Left( PasoPag->tidp,2) <> "EF" .and. ConPermi( oPadre, TabPri, TabPri[cusua], "TO000885" ) // .and. Upper( PasoPag->tidp) == PasoPag->tidp   jgv 02/09/2006
           xEd := PasoPag->fevedp
           If oLbx:lEditCol( oLbx:nColAct,@xEd,,,CLR_YELLOW,CLR_BLUE )
              If !Empty( xEd ) .and. xEd >= PasoPag->feemdp
                 * revisar si se cumple cantidad maxima de dias al ultimo venc. por modalidad  29/05/2009  jgv
                 If !Empty(TabPri[diasmaxpagos]) .and. xEd - PasoPag->feemdp > TabPri[diasmaxpagos]
                    MsgStop("Se está superando la cantidad máxima de días al último vencimiento"+CRLF+;
                            "indicada en la modalidad ( "+nacsb(TabPri[diasmaxpagos])+" dias max.)","ATENCION")
                 * revisar si se cumple cantidad maxima de dias al ultimo venc. por entidad 27/07/2009  jgv
                 ElseIf PasoEn->VALIVENPAG .and. xEd - PasoPag->feemdp > PasoEN->DiPrVe
                    MsgStop("Se está superando la cantidad máxima de días al último vencimiento"+CRLF+;
                            "indicada en la ficha de la entidad ( "+nacsb(PasoEN->DiPrVe)+" dias max.)","ATENCION")
                 Else
                    PasoPag->fevedp:= xEd
                    oLbx:nColAct := 7
                 EndIf
              EndIf
           EndIf

      Case oLbx:nColAct == 7 .and.;
           !Empty( PasoPag->tidp) .and.;
           PasoPag->nuevop .and.;
           Upper( PasoPag->tidp) == PasoPag->tidp .and.;
           !Empty( PasoPag->feemdp )

           if PasoPag->timodp == "N"
              If AllTrim(tabpri[rs_rut]) $ "_85913900-0_" .and. CuentaReg( "PasoDeu" )==1   // lib. la inglesa
                 xEd := PasoDeu->saldoactb
              elseif pasopag->tidp $ "RIV_RBV_RGV_RIC_RBC_RGC"
                 xed := Valorretarg(PASOPAG->TIDP)
              Else
                 xEd := PasoPag->vadp
              EndIf
              If oLbx:lEditCol( oLbx:nColAct,@xEd,ccanredon,,CLR_YELLOW,CLR_BLUE )
                 // permite cambiar el valor apesar de estar asignado
                 if xEd > 0 .and. PasoPag->vadp - xEd <= PasoPag->vasadp
                    dife  := xEd - PasoPag->vadp
                    difed := round(xEd/tabpri[tamona],2) - PasoPag->vadpd
                    PasoPag->vadp    += dife
                    PasoPag->vadpd   += difed
                    PasoPag->vasadp  := PasoPag->vadp-PasoPag->vaasdp
                    PasoPag->vasadpd := PasoPag->vadpd-PasoPag->vaasdpd
                    apagos[tvadp]    += dife
                    apagos[tvasadp]  += dife
                    apagos[tvadpd]   += difed
                    apagos[tvasadpd] += difed
                 EndIf
              endif
           else
              xEd := PasoPag->vadpd
              If oLbx:lEditCol( oLbx:nColAct,@xEd,ccanredon,,CLR_YELLOW,CLR_BLUE )
                 if xEd > 0 .and. PasoPag->vadpd - xEd <= PasoPag->vasadpd
                    difed := xEd - PasoPag->vadpd
                    dife  := round(xEd*tabpri[tamona],2) - PasoPag->vadp
                    PasoPag->vadp    += dife
                    PasoPag->vadpd   += difed
                    PasoPag->vasadp  := PasoPag->vadp-PasoPag->vaasdp
                    PasoPag->vasadpd := PasoPag->vadpd-PasoPag->vaasdpd
                    apagos[tvadp]      += dife
                    apagos[tvasadp]    += dife
                    apagos[tvadpd]     += difed
                    apagos[tvasadpd]   += difed
                 EndIf
              endif
           endif
           bTotales( oLbx, abSumas )

      Case oLbx:nColAct == 12 .and. PasoPag->nuevop .and. !Empty(PasoPag->tidp)

           xEd := PasoPag->RefAnti
           If oLbx:lEditCol( oLbx:nColAct,@xEd,,,CLR_YELLOW,CLR_BLUE )
              If !Empty( xEd ) .and. xEd <> PasoPag->refanti
                 PasoPag->RefAnti := xEd
              EndIf
           EndIf

   EndCase
   oLbx:Refresh()

EndIf

Return NIL
//-----------------------------------------------------------------------------------------
Static Function Vencim4Acciones( oLbx, aTabla, nPos )
Local i, aTemp := {}
Static aOrder
** inicializa
If aOrder == NIL .or. nPos == -1
   aOrder := Array(25)
   For i := 1 To 25
       aOrder[i] := .F.
   Next
EndIf

Do Case
 Case nPos == 2 .or. nPos == 3
   * ordenar tid+nudo
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[3]+x[4] < y[3]+y[4] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[3]+x[4] > y[3]+y[4] } )
   EndIf
 Case nPos == 4
   * ordenar vencim
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[7] < y[7] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[7] > y[7] } )
   EndIf
 Case nPos == 5
   * ordenar emision
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[5] < y[5] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[5] > y[5] } )
   EndIf
 Case nPos == 6
   * ordenar emision
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[6] < y[6] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[6] > y[6] } )
   EndIf
 Case nPos == 7
   * ordenar dias
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[10] < y[10] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[10] > y[10] } )
   EndIf
 Case nPos == 8
   * ordenar saldo venc
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[8]-x[9] < y[8]-y[9] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[8]-x[9] > y[8]-y[9] } )
   EndIf
 Case nPos == 9
   * ordenar valor venc
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[8] < y[8] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[8] > y[8] } )
   EndIf
 Case nPos == 10
   * ordenar valor venc
   aOrder[nPos] := !aOrder[nPos]
   If aOrder[nPos] ; aTemp := ASORT( aTabla,,, { |x, y| x[9] < y[9] } )
   Else            ; aTemp := ASORT( aTabla,,, { |x, y| x[9] > y[9] } )
   EndIf
EndCase

If nPos >= 2 .and. nPos <= 10
   aTabla := AClone(aTemp)
   oLbx:SetArray(aTabla)
   oLbx:Refresh()
   oLbx:Setfocus()
EndIf

Return NIL
//-----------------------------------------------------------------------------------------
Static Function EditarInteres( oPadre, TabPri, aMaeVen, oLbx, nInteres, aVarCon, lCambiar )
Local xEd, xEd2, xEd3, xEd4, i
Local lOk := .F.
MEMVAR ARROBAE
If lCambiar
   For i := 1 To Len(aMaeven)
       If aMaeVen[i,2]
          ** saldo por dias
          xEd2 := Abs( aMaeVen[oLbx:nAt,10] ) * aMaeVen[i,12]
          xEd3 := aMaeVen[i,8]-aMaeVen[i,9]
          **
          aMaeVen[i,13] := If( nInteres == 1, ISimple( xEd3, xEd2, aVarCon ), ICompuesto( xEd3, xEd2, aVarCon ) )
          **
       EndIf
   Next
   oLbx:Refresh()

ElseIf oLbx:nColAct == 9
   xEd := aMaeVen[oLbx:nAt,12]
   If oLbx:lEditCol( oLbx:nColAct,@xEd,"@K 999.99999",,CLR_YELLOW,CLR_BLUE)
      If xEd >= 0 .and. xEd <= 100
         aMaeVen[oLbx:nAt,12] := xEd
         ** saldo por dias
         xEd2 := Abs( aMaeVen[oLbx:nAt,10] ) * xEd
         xEd3 := aMaeVen[oLbx:nAt,8]-aMaeVen[oLbx:nAt,9]
         **
         aMaeVen[oLbx:nAt,13] := If( nInteres == 1, ISimple( xEd3, xEd2, aVarCon ), ICompuesto( xEd3, xEd2, aVarCon ) )
         **
         oLbx:DrawSelect()
      EndIf
   EndIf
EndIf

Return NIL
//------------------------------------------------------------------------------------
Static Function SumaSaldoVenc( aMaeVen, nSaldoVenc, lConIntereses )
Local i
DEFAULT lConIntereses := .F.

nSaldoVenc := 0
If lConIntereses
   For i := 1 To Len( aMaeVen )
       If aMaeVen[i,2]
          nSaldoVenc += aMaeVen[i,13]
       EndIf
   Next
Else
   For i := 1 To Len( aMaeVen )
       If aMaeVen[i,2]
          nSaldoVenc += aMaeVen[i,8]-aMaeVen[i,9]
       EndIf
   Next
EndIf

Return NIL
//----------------------------------------------------------------------------------------------------------------------------------------------------
Static Function PedirEntidad(tabpri,apagos,oLbx,oLbxPagos,oLbxDeuda,oDlg,lForzar,abSumas, ncriterio,verendosos,lTasaDoc, lSoloSucursal, oBtnCancelar )
Local aOpciones := {}, xEd, xEd2
Local aDim, oMenu, cBloqueEn, dev
Local Lugar, Llave
Local aResultado := {}
Local TMaeEn := {}
Local TConfiest := {}
Local recibe
Local aMaeEn := { "MAEEN",;
                 {"MAEEN.TIEN","MAEEN.KOEN","MAEEN.SUEN","MAEEN.NOKOEN"},;
                 {"MAEEN.KOEN","MAEEN.SUEN"},;
                 NIL,;
                 .F.,;
                 {"TIEN","KOEN","SUEN","NOKOEN"},;
                 {"Tipo",OemToansi("C¢digo"),"Suc","Nombre"},;
                 { 35,90,35,400 },;
                 {.f.,.f.,.f.,.f.},;
                 "Maestro de Entidades" }
Local aConfiEst := { "CONFIEST INNER JOIN CONFIGP ON CONFIGP.EMPRESA=CONFIEST.EMPRESA",;
                     {"CONFIEST.EMPRESA","CONFIEST.MODALIDAD","CONFIEST.ESUCURSAL","CONFIEST.EBODEGA","CONFIEST.ECAJA","CONFIEST.ELISTAVEN","CONFIEST.ELISTACOM","CONFIGP.RAZON","CONFIGP.CODPENTA"},;
                     {"CONFIEST.EMPRESA","CONFIEST.MODALIDAD"},;
                     NIL,;
                     .F.,;
                     { "Empresa+If(!Empty(CodPenta),' ('+CodPenta+')','')","Modalidad","eSucursal","eBodega","eCaja","eListaVen","eListaCom","Razon" },;
                     { "Empresa","Modalidad","Sucursal", IF( QuePais()=="ARG","Deposito","Bodega"),"Caja","L.P.Venta","L.P.Compra","Razon Social"},;
                     { 70,60,50,50,50,60,60, 250 },;
                     {.f.,.f.,.f.,.f.,.f.,.f.,.f.,.f. },;
                     "Tabla de Modalidades" }

DEFAULT lForzar := .F.
If GetAsyncKey( 13 ) .or. lForzar
   Do Case
      Case oLbx:nColAct == 1

           xEd := aPagos[adocumento][1,1]
           If !lForzar
              If oLbx:lEditCol( oLbx:nColAct,@xEd,"@K XXXXXXXXXXXXX",,CLR_YELLOW,CLR_BLUE)
                 If Empty( xEd )
                    If tabpri[sistema]=="ventas"
                       cBloqueEn := " MAEEN.TIEN IN ( 'C','A' ) AND MAEEN.TIPOSUC='P' "
                    Else
                       cBloqueEn := " MAEEN.TIEN IN ( 'P','A' ) AND MAEEN.TIPOSUC='P' "
                    EndIf
                    aResultado := BuscarSQL( oDlg, aMaeEn, {"MAEEN.KOEN","MAEEN.NOKOEN"},{13,30},,cBloqueEn )
                    If( !Empty( aResultado ), xEd := aResultado[1], NIL )
                 EndIf
              EndIf
           Else
              If Empty( xEd )
                 If tabpri[sistema]=="ventas"
                    cBloqueEn := " MAEEN.TIEN IN ( 'C','A' ) AND MAEEN.TIPOSUC='P' "
                 Else
                    cBloqueEn := " MAEEN.TIEN IN ( 'P','A' ) AND MAEEN.TIPOSUC='P' "
                 EndIf
                 aResultado := BuscarSQL( oDlg, aMaeEn, {"MAEEN.KOEN","MAEEN.NOKOEN"},{13,30},,cBloqueEn )
                 If( !Empty( aResultado ), xEd := aResultado[1], NIL )
              EndIf
           EndIf

           If TraeEnti( oDlg, xEd,.f., NIL )

              apagos[tsaldoant] := 0
              apagos[tabono]    := 0
              apagos[tsaldoact] := 0
              apagos[tvadp]     := 0
              apagos[tvaasdp]   := 0
              apagos[tvasadp]   := 0

              apagos[tsaldoantd] := 0
              apagos[tabonod]    := 0
              apagos[tsaldoactd] := 0
              apagos[tvadpd]     := 0
              apagos[tvaasdpd]   := 0
              apagos[tvasadpd]   := 0

              PasoDeu->(dbzap())
              PasoPag->(dbzap())

              // DE LA ENTIDAD INDICADA EN PASOEN  (libgest)
              if ncriterio <> 1
                 verendosos:= .f.
              endif

              TasaMone(nil,tabpri[fechtamo],.t.,8)
              recibe := TraeDeuda(oDlg,tabpri,tabpri[fechtamo],.T.,ncriterio,,verendosos,lSoloSucursal,tabpri[quemonedoc])
              tabpri[nocancelch] := recibe[1]
              tabpri[nocancellt] := recibe[2]
              tabpri[nocancelpa] := recibe[3]
              tabpri[gdvnodocum] := recibe[4]
              tabpri[nvvnodocum] := recibe[5]

              apagos[ndedocus]:=0
              PasoDeuT->( dbgotop() )
              WHILE PasoDeuT->(!eof())
                 apagos[tsaldoant] += PasoDeuT->saldoant
                 apagos[tabono]    += PasoDeuT->abono
                 apagos[tsaldoact] += PasoDeuT->saldoact

                 apagos[tsaldoantd] += PasoDeuT->saldoantd
                 apagos[tabonod]    += PasoDeuT->abonod
                 apagos[tsaldoactd] += PasoDeuT->saldoactd

                 apagos[ndedocus]++
                 PasoDeuT->(dbskip())
              ENDDO
              SysRefresh()

              PasoDeu->(dbgotop())
              PasoPag->(dbgotop())

              aPagos[mayorlinpa]:=0
              WHILE PasoPag->(!eof())
                 apagos[tvadp]    += PasoPag->vadp
                 apagos[tvaasdp]  += PasoPag->vaasdp + PasoPag->vavudp
                 apagos[tvasadp]  += PasoPag->vasadp - PasoPag->vavudp

                 apagos[tvadpd]    += PasoPag->vadpd
                 apagos[tvaasdpd]  += PasoPag->vaasdpd + PasoPag->vavudpd
                 apagos[tvasadpd]  += PasoPag->vasadpd - PasoPag->vavudpd

                 aPagos[mayorlinpa]++
                 IF !PasoPag->nuevop
                    apagos[ndedocus]++
                 ENDIF
                 PasoPag->(dbskip())
              ENDDO
              SysRefresh()

              aPagos[adocumento][1,1] := xEd
              aPagos[adocumento][1,2] := PasoEn->NoKoEn
              oLbx:Refresh()

              oLbxPagos:Hide()
              PasoPag->( dbGoTop() )
              oLbxPagos:UpStable()
              bTotales( oLbxPagos, abSumas )
              oLbxPagos:Refresh()
              oLbxPagos:Show()
              oLbxPagos:nColAct := 2

              oLbxDeuda:Hide()
              PasoDeu->( dbGoTop() )
              oLbxDeuda:UpStable()
              bTotales2( oLbxDeuda, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] )
              oLbxDeuda:Refresh()
              oLbxDeuda:Show()
              oLbxDeuda:nColAct := 3

           ELSE

              MsgAlert( "ENTIDAD INDICADA NO EXISTE" )

           ENDIF

      Case ( oLbx:nColAct == 4 .or. oLbx:nColAct == 5 )

           If MsgYesNo( "La Empresa/Sucursal se Selecciona al Ingresar al Sistema"+CRLF+;
                        "Desea Cambiar la Modalidad para Asignar Nueva Sucursal","Favor Seleccionar..."  )
              dev := RecorreSQL( odlg, tabpri, aConfiEst,,,.T.)
              If !Empty(dev) ; dev[1] := Left(dev[1],2) ; EndIf
              //-----validar permiso de modalidades
              If !Empty( dev ) .and. !PermiModa( Tabpri, tabpri[cusua], dev[2], oDlg, .f. )
                 dev := ""
              EndIf
              If !Empty( dev ) .and. SeekSQL( "CONFIEST",TConfiest,{"EMPRESA","MODALIDAD"},{dev[1],dev[2]})
                 TabpriCambiaEmpresa( TabPri, dev[1] )
                 TabpriConfiest(tabpri,tconfiest,"" )
                 TabPri[mododeact ] := "ing"
                 tone(120,1); tone(220,1); tone(320,1)
                 CambiaModVentana( TabPri )
                 ** inicializar variables de pago
                 Eval( oBtnCancelar:bAction )

                 MsgInfo( "FUE CAMBIADA LA MODALIDAD","ATENCION..." )
              Else
                 MsgInfo("Se mantiene la misma Empresa/Sucursal y Modalidad","ATENCION" )
              Endif
           EndIf

   EndCase
EndIf

Return NIL
//--------------------------------------------------------------------------------------------------------------------------------------
Static Function otraEntidad(tabpri,apagos,oLbx,oLbxPagos,oLbxDeuda,oDlg,lForzar,abSumas, ncriterio,verendosos, lTasaDoc, lSoloSucursal )
Local aOpciones := {}, xEd, xEd2
Local aDim, oMenu, cBloqueEn
Local Lugar, Llave,I
Local aResultado := {}
Local TMaeEn := {}
Local TESTAN := {}
Local TMaes := {}
Local aLigados := {}
Local cLigados := ""
Local hStmt := 0
Local lHayDatos := .F.
Local aMaeEn := { "MAEEN",;
                 {"MAEEN.TIEN","MAEEN.KOEN","MAEEN.SUEN","MAEEN.NOKOEN"},;
                 {"MAEEN.KOEN","MAEEN.SUEN"},;
                 NIL,;
                 .F.,;
                 {"TIEN","KOEN","SUEN","NOKOEN"},;
                 {"Tipo",OemToansi("C¢digo"),"Suc","Nombre"},;
                 { 35,90,35,400 },;
                 {.f.,.f.,.f.,.f.},;
                 "Maestro de Entidades" }
xed:= " "
if tabpri[sistema] == "ventas"
   cBloqueEn := " MAEEN.TIEN IN ( 'C','A' )"
else
   cBloqueEn := " MAEEN.TIEN IN ( 'P','A' )"
endif

** PONE EN BLOQUEEN LAS ENTIDADES QUE YA ESTAN
Lugar:= Pasodeu->(recno())
TESTAN:={}
WHILE Pasodeu->(!EOF())
    IF ASCAN(Testan,Pasodeu->endo) == 0
       AADD(Testan,Pasodeu->endo)
    ENDIF
    Pasodeu->(Dbskip())
ENDDO
Pasodeu->(Dbgoto(Lugar))
For I:= 1 to len(testan)
  cbloqueen+= " AND MAEEN.KOEN <> '"+ Testan[I]+ "' "
NEXT

** si la entidad forma parte de un grupo de pago, solo pueden desplegarse dichas entidades del grupo   jgv 25/07/2002
If SeekSQL("TABLIGEN",,{"KOEN"},{aPagos[adocumento][1,1]})
   hStmt := 0 ; TMaes := {} ; lHayDatos := .F.
   hStmt := CrearCursor( TMaes,"SELECT DISTINCT KOLIG "+;
                               " FROM TABLIGEN WITH ( NOLOCK ) "+;
                               " WHERE KOEN='"+aPagos[6][1,1]+"' "+;
                                 " AND TIPOLIG='P'  ", @lHayDatos )
   While lHayDatos
      cLigados += "'"+AllTrim(Vcc(TMaes,"KOLIG"))+"',"
      If SkipSQL( hStmt, TMaes ) == 0
         EXIT
      EndIf
   EndDo
   LiberaCursor( hStmt )
   cLigados  := Left( cLigados, Len(cLigados)-1 )
   cbloqueen += " AND EXISTS ( SELECT * FROM TABLIGEN WHERE TIPOLIG='P' AND KOLIG IN ("+cLigados+") AND MAEEN.KOEN=TABLIGEN.KOEN ) "
   If !Empty( cLigados )
      cLigados := StrTran( cLigados, "'", "" )
      MsgInfo("Entidad esta ligada a Grupos de Pago ("+cLigados+")"+CRLF+;
              "Solo serán desplegados para búsqueda dichos grupos"+CRLF+;
              "( Modelamiento -> Definición de entidades ligadas para pago )","ATENCION")
   EndIf
EndIf

aResultado := BuscarSQL(oDlg,aMaeEn, {"MAEEN.KOEN","MAEEN.NOKOEN"},{13,30},,cBloqueEn )

If !Empty(aResultado)
   xEd := aResultado[1]

   pasodeuT->(dbgobottom())
   lugar:= pAsodeuT->(RECNO())
   traemasdeuda(odlg,tabpri,xed,ncriterio,LTASADOC,lSoloSucursal,CtaMultiEmpresa(),tabpri[fechtamo],tabpri[quemonedoc])

   apagos[ndedocus]:=0
   PasoDeuT->(dbgoto(LUGAR))
   PASODEUT->(DBSKIP())
   WHILE PasoDeuT->(!eof())
      apagos[tsaldoant] += PasoDeuT->saldoant
      apagos[tabono]    += PasoDeuT->abono
      apagos[tsaldoact] += PasoDeuT->saldoact

      apagos[tsaldoantd] += PasoDeuT->saldoantd
      apagos[tabonod]    += PasoDeuT->abonod
      apagos[tsaldoactd] += PasoDeuT->saldoactd

      apagos[ndedocus]++
      PasoDeuT->(dbskip())
   ENDDO
   SysRefresh()

   PasoDeu->(dbgotop())
   PasoPag->(dbgotop())

   oLbx:Refresh()

   oLbxPagos:Hide()
   PasoPag->( dbGoTop() )
   oLbxPagos:UpStable()
   bTotales( oLbxPagos, abSumas )
   oLbxPagos:Refresh()
   oLbxPagos:Show()
   oLbxPagos:nColAct := 2

   oLbxDeuda:Hide()
   PasoDeu->( dbGoTop() )
   oLbxDeuda:UpStable()
   bTotales2( oLbxDeuda, {8,9,10},{6,7,8}, abSumas,apagos[enpesos] )
   oLbxDeuda:Refresh()
   oLbxDeuda:Show()
   oLbxDeuda:nColAct := 3

EndIf

Return NIL
//---------------------------------------------------------------------------------------------------------------------------
static Function OpenPagosr3c()
Local lval := .f.
Local aStruct

If !CrearPaso( "PASOEN",  "MAEEN" )  ; Return .f. ; EndIf

aStruct := {;
             { "idarchivo ", "N", 19, 0 },;
             { "empresa   ", "C", 02, 0 },;
             { "tidp      ", "C", 03, 0 },;
             { "linea     ", "N", 04, 0 },;
             { "tido      ", "C", 03, 0 },;
             { "nudo      ", "C", 10, 0 },;
             { "endo      ", "C", 13, 0 },;
             { "suendo    ", "C", 13, 0 },;
             { "emdp      ", "C", 13, 0 },;
             { "suemdp    ", "C", 03, 0 },;
             { "modo      ", "C", 03, 0 },;
             { "timodo    ", "C", 01, 0 },;
             { "tamodo    ", "N", 19, 5 },;
             { "feulvedo  ", "D", 08, 0 },;
             { "abono     ", "N", 19, 5 },;
             { "abonod    ", "N", 19, 5 },;
             { "archivo   ", "C", 08, 0 },;
             { "tipolin   ", "C", 01, 0 },;
             { "ultlin    ", "L", 01, 0 },;
             { "nreg      ", "N", 07, 0 },;
             { "nucudp    ", "C", 08, 0 },;
             { "MARCADO   ", "C", 01, 0 },;
             { "valdocuB  ", "N", 19, 5 },;
             { "valdocudB ", "N", 19, 5 },;
             { "saldoantB ", "N", 19, 5 },;
             { "saldoactB ", "N", 19, 5 },;
             { "saldoantdB", "N", 19, 5 },;
             { "saldoactdB", "N", 19, 5 },;
             { "TCASIG    ", "N", 19, 5 },;
             { "bloqueapag", "C", 01, 0 };
           }
dbCreate( "PASODEU.DBF", aStruct )
lval:= net_use( "PASODEU" ) ; IF !lval ; return .f. ; ENDIF
INDEX ON FIELD->NREG TO PASODEU

aStruct := {;
             { "valdocu   ", "N", 19, 5 },;
             { "aboant    ", "N", 19, 5 },;
             { "saldoant  ", "N", 19, 5 },;
             { "abono     ", "N", 19, 5 },;
             { "saldoact  ", "N", 19, 5 },;
             { "nreg      ", "N", 07, 0 },;
             { "valdocud  ", "N", 19, 5 },;
             { "aboantd   ", "N", 19, 5 },;
             { "saldoantd ", "N", 19, 5 },;
             { "abonod    ", "N", 19, 5 },;
             { "saldoactd ", "N", 19, 5 },;
             { "valiva    ", "N", 19, 5 },;
             { "valneto   ", "N", 19, 5 },;
             { "valivad   ", "N", 19, 5 },;
             { "valnetod  ", "N", 19, 5 } ;
           }
dbCreate( "pasodeut.dbf", aStruct )
lval:= net_use( "PASODEUT" )     ; IF !lval ; return .f. ; ENDIF
INDEX ON FIELD->NREG TO PASODEUT

aStruct := {;
             { "idmaedpce ", "N", 19, 0 },;
             { "linea     ", "N", 04, 0 },;
             { "empresa   ", "C", 02, 0 },;
             { "tidp      ", "C", 03, 0 },;
             { "emdp      ", "C", 13, 0 },;
             { "suemdp    ", "C", 03, 0 },;
             { "nudp      ", "C", 10, 0 },;
             { "endp      ", "C", 13, 0 },;
             { "cudp      ", "C", 16, 0 },;
             { "nucudp    ", "C", 08, 0 },;
             { "modp      ", "C", 03, 0 },;
             { "timodp    ", "C", 01, 0 },;
             { "tamodp    ", "N", 19, 5 },;
             { "feemdp    ", "D", 08, 0 },;
             { "fevedp    ", "D", 08, 0 },;
             { "vadp      ", "N", 19, 5 },;
             { "vadondp   ", "N", 19, 5 },;
             { "vaasdp    ", "N", 19, 5 },;
             { "vasadp    ", "N", 19, 5 },;
             { "vavudp    ", "N", 19, 5 },;
             { "vaasant   ", "N", 19, 5 },;
             { "vadpd     ", "N", 19, 5 },;
             { "vaasdpd   ", "N", 19, 5 },;
             { "vasadpd   ", "N", 19, 5 },;
             { "vavudpd   ", "N", 19, 5 },;
             { "vaasantd  ", "N", 19, 5 },;
             { "elegido   ", "L", 01, 0 },;
             { "nuevop    ", "L", 01, 0 },;
             { "nuevopaux ", "L", 01, 0 },;
             { "refanti   ", "C", 80, 0 },;
             { "docuenanti", "C", 11, 0 },;
             { "koendoso",   "C", 13, 0 },;
             { "noendoso",   "C", 50, 0 },;
             { "nuvisa",     "C", 10, 0 },;
             { "kovisador",  "C", 13, 0 },;
             { "cuotas   ",  "N", 19, 5 },;
             { "archirsd",   "C", 08, 0 },;
             { "idrsd",      "N", 19, 5 },;
             { "docrelant",  "C", 50, 0 },;
             { "nutransmi",  "C", 13, 0 },;
             { "mensajeTB",  "C",150, 0 },;
             { "idmaedptb",  "N", 19, 5 } ;
           }
dbCreate( "pasopag.dbf", aStruct )
lval:= net_use( "pasopag" ) ; IF !lval ; return .f. ; ENDIF
INDEX ON FIELD->LINEA            TAG LINEA TO PASOPAG
INDEX ON FIELD->TIDP+FIELD->NUDP TAG TINU  TO PASOPAG
PasoPag->(dbsetorder(0))

RETURN lval
//--------------------------------------------------------------------------------------------------------------------------
Static Function bTotales( oLbx, aBSumas )
Local i := 0
Local cCanRedon
MEMVAR DEF_REDON, ARROBAE
If DEF_REDON == 0
   cCanRedon := ARROBAE + " 99999,999,999"
Else
   cCanRedon := ARROBAE + " 9999,999,999.99"
EndIf
Return NIL
//--------------------------------------------------------------------------------------------------------------------------
Static Function bTotales2( oLbx, aFoot, aSum, aBSumas,xmonnac)
Local i := 0
Local cCanRedon
MEMVAR DEF_REDON, ARROBAE
DEFAULT xmonnac := .t.
If DEF_REDON == 0 .and. xmonnac
   cCanRedon := ARROBAE + " 99999,999,999"
Else
   cCanRedon := ARROBAE + " 9999,999,999.99"
EndIf
Return NIL
//--------------------------------------------------------------------------------------------------------------------------
static FUNCTION grabapagosr3c(opadre,Tabpri,aPagos,nudeudas)
Local grabar, arepar, dife, xtdpaim, nocuadven
Local objLocal, oErrorActual, cAvisos, i
Local TMaeVen := {}
Local aMaeVen := {}
Local TMaeEdo := {}
Local TMaeDpCe := {}
Local TMaeDpCd := {}
Local aCadena := {}
Local cnudp
Local cadena := ""
Local cadena2:= ""
Local hStmt := 0
Local lHayDatos := .F.
Local xCero := "0"
local cidmaedpce,cidpce2
LOCAL lahoragrab:= 0
Local xElDia, xfechaHora, MaxReferencia
Local lSalir := .F.
local xtipo
local tlosdpce:={}
Local aGrabado := {}
Local Tnomdim := {}
Local nItemSap, cTido, cNudo, cEndo, cidrst, xxsap, cEntidad_ncv, xnudp
Local TMaes  := {}
Local ARE_ACCOUNTRECEIVABLE := {}
LOCAL Opcont:= 0
Static lrandomsap:= .f.
MEMVAR DEF_REDON, lAsigFech, ARROBAE
PRIVATE cElError := ""
xtdpaim:={}
nocuadven := .F.
cAvisos := ""
*DEFAULT lAsigFech := .T.
If !FechaServidor( TabPri )
   Return xTdPaIm
EndIf

If DEF_REDON <> 0
   xCero := "0.0"
EndIf

*** borrar lineas en blanco jgv 11/08/2003
PasoPag->(dbgotop())
WHILE PasoPag->(!eof())
   If Empty(PasoPag->TiDp)
      PasoPag->( dbDelete() )
   EndIf
   PasoPag->( dbSkip() )
EndDo
PasoPag->(dbgotop())

oPadre:Disable()

oErrorActual := ErrorBlock( {|o| PosibleError(o) } )
BEGIN SEQUENCE

    xfechaHora := fehoraser()   // fecha actual en el servidor
    xElDia     := xfechaHora[1]
    lahoragrab := xfechaHora[2]

    If !EjecuteSQL( "BEGIN TRANSACTION",,.f.,@cElError ) ; BREAK ; EndIf

    MaxReferencia := MaxReferencia() + 1 // busca un numero mayor y unico    jgv 31/07/2008

    DO CASE
       CASE nudeudas <> 1
            PasoPag->(dbgotop())
            PasoDeu->(dbgotop())
            While PasoDeu->( !Eof() )
               If PasoDeu->TiDp == "ncv" .and. PasoDeu->Tido $ "_BLV_BSV_" .and. Empty( PasoDeu->endo )
                  PasoDeu->EnDo := cEntidad_ncv
                  EjecuteSQL("UPDATE MAEEDO SET ENDO='"+cEntidad_ncv+"' WHERE IDMAEEDO="+nacsb(PasoDeu->idarchivo) )
               EndIf
               PasoDeu->( dbSkip() )
            EndDO
            **
            PasoPag->(dbgotop())
            WHILE PasoPag->(!eof())
               grabar:= .t.
               If Round( If( PasoPag->timodp == "N", PasoPag->vadp, PasoPag->vadpd ),DEF_REDON ) == Round( 0,DEF_REDON ) ;
                .or. empty(PasoPag->tidp) ;
                .or. ( !PasoPag->nuevop .and. PasoPag->vaasdp == PasoPag->vaasant )
                  grabar:= .f.
               endif
               IF grabar
                  If PasoPag->nuevop
                     aCadena := {}
                     **
                     If DameNudp( TabPri, PasoPag->tidp, @cElError, @xnudp )
                        BREAK
                     EndIf
                     PasoPag->nudp := xnudp
                     **

                     If SeekSQL("MAEDPCE",,{"EMPRESA","TIDP","NUDP","ENDP"},{PasoPag->empresa,PasoPag->tidp,PasoPag->nudp,PasoPag->endp})
                        cElError := "Documento de pago no debe estar repetido, reintente"+CRLF+PasoPag->empresa+" "+PasoPag->tidp+" "+PasoPag->nudp+" "+PasoPag->endp
                        BREAK
                     EndIf

                     ** para evitar TIDP en blanco   jgv 28/11/2005
                     If Empty( PasoPag->tidp )
                        BREAK
                     EndIf

                     ** existe restriccion para dejar anticipos    jgv 25/03/2009
                     If Round( PasoPag->vadp-PasoPag->vaasdp-PasoPag->vavudp,2) <> Round(0,2)
                        If SeekSQL( "MAEUS",,{"KOUS","KOOP"},{Tabpri[cusua],"NO000080"} )
                           cElError := "El usuario no esta autorizado para generar anticipos"
                           BREAK
                        EndIf
                     EndIf

                     aCadena := { {"EMPRESA",PasoPag->empresa},;
                                  {"TIDP",   PasoPag->tidp   },;
                                  {"NUDP",   PasoPag->nudp   },;
                                  {"ENDP",   PasoPag->endp   },;
                                  {"NUCUDP", PasoPag->nucudp },;
                                  {"CUDP",   PasoPag->cudp   },;
                                  {"EMDP",   PasoPag->emdp   },;
                                  {"SUEMDP", PasoPag->suemdp },;
                                  {"FEEMDP", PasoPag->feemdp },;
                                  {"FEVEDP", PasoPag->fevedp },;
                                  {"MODP",   PasoPag->modp   },;
                                  {"TIMODP", PasoPag->timodp },;
                                  {"TAMODP", PasoPag->tamodp },;
                                  {"REFANTI",PasoPag->refanti},;
                                  {"SUREDP", tabpri[sucursal]},;
                                  {"CJREDP", tabpri[caja]    },;
                                  {"KOTU"  , tabpri[turno]   },;
                                  {"KOFUDP", tabpri[cusua]   },;
                                  {"KOTNDP", tabpri[rs_rut]  },;
                                  {"SUTNDP", tabpri[caja]    },;
                                  {"TUVOPROTES",.F.          } }

                     If PasoPag->timodp == "N"
                        AAdd( aCadena, {"VADP"  , PasoPag->vadp   } )
                        AAdd( aCadena, {"VAASDP", PasoPag->vaasdp } )
                        AAdd( aCadena, {"VAVUDP", PasoPag->vavudp } )
                        If Round( PasoPag->vadp-PasoPag->vaasdp-PasoPag->vavudp,2) == Round(0,2)
                           AAdd( aCadena,{ "ESASDP", "A" } )
                        Else
                           AAdd( aCadena,{ "ESASDP", "P" } )
                        EndIf
                     else
                        AAdd( aCadena, {"VADP"  , PasoPag->vadpd   } )
                        AAdd( aCadena, {"VAASDP", PasoPag->vaasdpd } )
                        AAdd( aCadena, {"VAVUDP", PasoPag->vavudpd } )
                        if Round( PasoPag->vadpd-PasoPag->vaasdpd-PasoPag->vavudpd,2) == Round(0,2)
                           AAdd( aCadena,{ "ESASDP", "A" } )
                        else
                           AAdd( aCadena,{ "ESASDP", "P" } )
                        endif
                     endif

                     If PasoPag->tidp $ "EFV_EFC_CRV_CRC_RIV_RBV_RGV_RIC_RBC_RGC" .or. UPPER(PasoPag->tidp) <> PasoPag->tidp
                        if PasoPag->timodp == "N"
                           AAdd( aCadena,{ "VAABDP", PasoPag->vadp } )
                        Else
                           AAdd( aCadena,{ "VAABDP", PasoPag->vadpd } )
                        EndIf
                        AAdd( aCadena,{ "ESPGDP", "C" } )
                     Else
                        AAdd( aCadena,{ "VAABDP", 0.0 } )    // jgv 24/09/2002 quedaba con valor NULL
                        AAdd( aCadena,{ "ESPGDP", "P" } )
                     EndIf

                     If PasoPag->tidp $ "CHC_LTV_CRC_RIC_RBC_RGC_PTB"
                        AAdd( xtdpaim, PasoPag->endp + PasoPag->tidp + PasoPag->nudp )
                     endif

                     AAdd( aCadena, {"CUOTAS"    , PasoPag->cuotas   })
                     AADD( aCadena, {"HORAGRAB"  , lahoragrab        })
                     AADD( aCadena, {"LAHORA"    , xElDia            })
                     AADD( aCadena, {"ARCHIRSD"  , PASOPAG->ARCHIRSD })
                     AADD( aCadena, {"IDRSD"     , PASOPAG->IDRSD    })
                     AAdd( aCadena, {"REFERENCIA", MaxReferencia     })

                     lahoragrab++
                     If !EjecuteSQL( "INSERT INTO MAEDPCE "+CampoValor( "ing", aCadena ),,.f.,@cElError  )
                        BREAK
                     EndIf
                     cidmaedpce := UltimoId()
                     PasoPag->IdMaeDpCe := cidmaedpce
                  else

                     // ANTICIPOS
                     TMaeDpCe := {}
                     If SeekSQL( "MAEDPCE",TMaeDpCe,{"IDMAEDPCE"},{PasoPag->IDMAEDPCE},"ENDP,TIDP,NUDP,TIMODP,VAASDP" )
                        cidmaedpce:= pasopag->idmaedpce
                        IF !EMPTY(pasopag->koendoso)
                           cadena:= " ENDP = '"+pasopag->endp+"', "
                        else
                           cadena := ""
                        endif
                        if Vcc( TmaeDpCe,"timodp" ) == "N"
                           cadena += "VAASDP=ROUND( "+AllTrim(Str(PasoPag->vaasdp))+","+AllTrim(Str(DEF_REDON))+"),"
                           cadena += "ESASDP=CASE"+;
                                            " WHEN ROUND( VADP-VAVUDP-"+AllTrim(Str(PasoPag->vaasdp))+","+AllTrim(Str(DEF_REDON))+") <= "+xCero+" THEN 'A' "+;
                                            " ELSE 'P' "+;
                                           "END "
                        else
                           cadena += "VAASDP=ROUND( "+AllTrim(Str(PasoPag->vaasdpd))+",2),"
                           cadena += "ESASDP=CASE"+;
                                            " WHEN ROUND( VADP-VAVUDP-"+AllTrim(Str(PasoPag->vaasdpd))+",2) <= "+xCero+" THEN 'A' "+;
                                            " ELSE 'P' "+;
                                           "END "
                        endif
                        If !EjecuteSQL( "UPDATE MAEDPCE SET "+cadena+" WHERE IDMAEDPCE="+nacsb(cidmaedpce),,.f.,@cElError  )
                           BREAK
                        EndIf

                        ** existe restriccion para dejar anticipos o el anticipo se sobre-asigno    jgv 25/03/2009
                        TMaes := {}
                        If SeekSQL( "MAEDPCE",TMaes,{"IDMAEDPCE"},{PasoPag->IDMAEDPCE},"VADP,VAASDP,VAVUDP" )
                           If Round( Vcc(TMaes,"vadp")-Vcc(TMaes,"vaasdp")-Vcc(TMaes,"vavudp"),2) < 0  // sobre-asignado !!!   jgv  15/10/2009
                              cElError := "El documento no puede ser sobre-asignado"
                              BREAK
                           ElseIf Round( Vcc(TMaes,"vadp")-Vcc(TMaes,"vaasdp")-Vcc(TMaes,"vavudp"),2) <> Round(0,2)    // dejó un anticipo
                              If SeekSQL( "MAEUS",,{"KOUS","KOOP"},{Tabpri[cusua],"NO000080"} )
                                 cElError := "El usuario no esta autorizado para generar anticipos"
                                 BREAK
                              EndIf
                           EndIf
                        EndIf

                     else
                        cElError := "No se encontró anticipo existente"
                        BREAK
                     endif

                  endif

                  PasoDeu->(dbgotop())
                  WHILE PasoDeu->(!eof())
                     cadena := ""
                     IF PasoDeu->archivo == "MAEEDO  "
                        IF PasoDeu->linea == PasoPag->linea .and. If( PasoPag->timodp == "N", PasoDeu->abono, PasoDeu->abonod ) > 0
                           TMaeEdo := {}
                           If !SeekSQL( "MAEEDO",TMaeEdo,{"IDMAEEDO"},{Pasodeu->idarchivo},"IDMAEEDO,EMPRESA,ENDO,TIDO,NUDO,VAPIDO,VAABDO,TIMODO,BLOQUEAPAG" )
                              cElError := "No se encontró documento en maestro 3"
                              BREAK
                           ELSE
                              IF VCC(Tmaeedo,"BLOQUEAPAG") == "S"
                                cElError :=  "1.- EN EL INTERTANDO FUE DENEGADA LA AUTORIZACION DE PAGO PARA EL DOCUMENTO : "+ PASODEU->TIDO+ " " + PASODEU->NUDO
                                BREAK
                              ENDIF
                           Endif

                           dife:= MAX(0,(Vcc(Tmaeedo,"vapido")-Vcc(Tmaeedo,"vaabdo")))

                           if Vcc( Tmaeedo,"timodo" ) == "N"
                              arepar:= max(0,PasoDeu->abono - dife)
                              cadena := "VAABDO= COALESCE(VAABDO,0) +" +alltrim(str(pasodeu->abono))+" "
                           else
                              arepar:= max(0, PasoDeu->abonod - dife)
                              cadena := "VAABDO= COALESCE(VAABDO,0) +" +alltrim(str(pasodeu->abonod))+" "
                           Endif
                           If !EjecuteSQL( "UPDATE MAEEDO SET "+cadena+" WHERE IDMAEEDO="+nacsb(Vcc(TmaeEdo,"idmaeedo")),,.f.,@cElError  )
                              BREAK
                           EndIf

                           cadena:= "ESPGDO=CASE"+;
                                          " WHEN ROUND(VABRDO,2)-ROUND(VAABDO,2)-COALESCE(ROUND(VAIVARET,2),0) <= 0 THEN 'C' "+;
                                          " ELSE ESPGDO END "

                           If !EjecuteSQL( "UPDATE MAEEDO SET "+cadena+" WHERE IDMAEEDO="+nacsb(Vcc(TmaeEdo,"idmaeedo")),,.f.,@cElError  )
                              BREAK
                           EndIf

                           IF arepar > 0
                              TMaeVen := {}
                              aMaeVen := {}
                              hStmt := CrearCursor( TMaeVen,;
                                                    "SELECT VAVE,VAABVE,IDMAEVEN "+;
                                                    " FROM MAEVEN WITH ( NOLOCK ) "+;
                                                    " WHERE IDMAEEDO="+nacsb(Vcc(TmaeEdo,"idmaeedo"))+;
                                                      " AND ESPGVE<>'C' ", @lHayDatos )
                              WHILE lHayDatos
                                 AAdd( aMaeVen, { Round(Vcc(Tmaeven,"vave"),2)-Round(Vcc(Tmaeven,"vaabve"),2), Vcc(Tmaeven,"idmaeven") } )
                                 If SkipSQL( hStmt, Tmaeven ) == 0
                                    EXIT
                                 EndIf
                              ENDDO
                              LiberaCursor( hStmt )
                              For i := 1 To Len( aMaeVen )
                                 dife:= MIN( arepar, aMaeVen[i,1] )
                                 ** abono a vencimiento
                                 cadena := "VAABVE= COALESCE(VAABVE,0.0)+"+AllTrim(Str(dife))+" "
                                 If !EjecuteSQL( "UPDATE MAEVEN SET "+cadena+" WHERE IDMAEVEN="+nacsb(aMaeVen[i,2]),,.f.,@cElError  )
                                    BREAK
                                 EndIf
                                 ** estado del abono
                                 cadena := "ESPGVE=CASE WHEN ROUND(VAVE,2)-ROUND(VAABVE,2) <= 0 THEN 'C' ELSE ESPGVE END "
                                 If !EjecuteSQL( "UPDATE MAEVEN SET "+cadena+" WHERE IDMAEVEN="+nacsb(aMaeVen[i,2]),,.f.,@cElError  )
                                    BREAK
                                 EndIf
                                 arepar -= dife
                                 If arepar <= 0
                                    EXIT
                                 EndIf
                              NEXT
                              //--- esto es solo un warning...lo dijo RAM
                              If Round(arepar,2) <> Round(0.00,2)
                                 cAvisos += "No cuadró abono con vencimientos : " + Vcc( TMAEEDO,"TIDO")+" "+Vcc( TMAEEDO,"NUDO") +" "+ STR(AREPAR) +CRLF
                                 nocuadven := .T.
                              EndIf

                           ENDIF

                           aCadena := {}
                           AAdd( aCadena, {"IDMAEDPCE", cidmaedpce } )
                           if PasoPag->timodp == "N"
                              AAdd( aCadena, {"VAASDP", PasoDeu->Abono  } )
                           else
                              AAdd( aCadena, {"VAASDP", PasoDeu->Abonod } )
                           endif
                           If lAsigFech
                             AAdd( aCadena, {"FEASDP", xElDia } )
                           Else
                             AAdd( aCadena, {"FEASDP", PasoPag->feemdp } )
                           Endif

                           AAdd( aCadena, {"IDRST",    PasoDeu->idarchivo } )
                           AAdd( aCadena, {"TIDOPA",   PasoDeu->tido } )
                           AAdd( aCadena, {"ARCHIRST", PasoDeu->archivo } )
                           AAdd( aCadena, {"TCASIG",   pasodeu->tcasig } )
                           cTido := PasoDeu->tido
                           cNudo := PasoDeu->nudo
                           cEnDo := PasoDeu->Endo
                           AAdd( aCadena, {"REFERENCIA", MaxReferencia    })
                           AAdd( aCadena, {"KOFUASDP",   Tabpri[cusua]    })
                           AAdd( aCadena, {"SUASDP",     Tabpri[sucursal] })
                           AAdd( aCadena, {"CJASDP",     Tabpri[caja]     })
                           AADD( aCadena, {"HORAGRAB",   lahoragrab       })
                           AADD( aCadena, {"LAHORA",     xElDia           })

                           If !EjecuteSQL( "INSERT INTO MAEDPCD " +CampoValor( "ing", aCadena ),,.f.,@cElError  )
                              BREAK
                           EndIf
                        EndIf

                     ElseIF PasoDeu->archivo == "CDOCCOE "
                        IF PasoDeu->linea == PasoPag->linea .and. If( PasoPag->timodp == "N", PasoDeu->abono, PasoDeu->abonod ) > 0
                           TMaeEdo := {}
                           If !SeekSQL( "CDOCCOE",TMaeEdo,{"IDDOCCOE"},{ Pasodeu->idarchivo},"IDDOCCOE,EMPRESA,ENDO,TIDO,NUDO,0.0 AS VAPIDO,VAABDO,TIMODO" )
                              cElError := OemToAnsi( "No se encontr¢ documento en maestro 3")
                              BREAK
                           Endif

                           dife:= MAX( 0, ( Vcc( Tmaeedo,"vapido")-Vcc( Tmaeedo,"vaabdo") ) )
                           if Vcc( Tmaeedo,"timodo" ) == "N"
                              arepar:= max(0, PasoDeu->abono - dife)
                              cadena += "VAABDO=ROUND( COALESCE(VAABDO,0)+"+AllTrim( Str(PASODEU->ABONO) )+","+AllTrim(Str(DEF_REDON))+"),"
                              cadena += "ESPGDO=CASE"+;
                                              " WHEN ROUND( ROUND(VABRDO,2)-COALESCE(ROUND(VAABDO,2),0.0)-"+AllTrim(Str(Round(PASODEU->ABONO,2)))+","+AllTrim(Str(DEF_REDON))+") <= "+xCero+" THEN 'C' "+;
                                              " ELSE ESPGDO "+;
                                        "END "
                           else
                              arepar:= max(0, PasoDeu->abonod - dife)
                              cadena += "VAABDO=ROUND( COALESCE(VAABDO,0.0)+"+AllTrim( Str(PASODEU->ABONOd) )+",2),"
                              cadena += "ESPGDO=CASE"+;
                                              " WHEN ROUND(VABRDO,2)-ROUND("+AllTrim(Str(PASODEU->ABONOd))+",2) <= "+xCero+" THEN 'C' "+;
                                              " ELSE ESPGDO "+;
                                        "END "
                           Endif

                           If !EjecuteSQL( "UPDATE CDOCCOE SET "+cadena+" WHERE IDDOCCOE="+nacsb(Vcc(TmaeEdo,"idDocCoe")),,.f.,@cElError )
                              BREAK
                           EndIf

                           * descontar los protestos   jgv 16/09/2009
                           If PasoDeu->Tido == "chv"
                              TMaeEdo := {}
                              SeekSQL( "CDOCCOE",TMaeEdo,{"IDDOCCOE"},{Pasodeu->idarchivo} )
                              If Vcc(TMaeEdo,"ESPGDO")=="C"
                                 If !EjecuteSQL( "UPDATE MAEEN SET PROTEVIGE=COALESCE(PROTEVIGE,0)-1 WHERE KOEN='"+PasoDeu->Endo+"' ",,.f.,@cElError )
                                    BREAK
                                 EndIf
                              EndIf
                           EndIf

                           aCadena := {}
                           AAdd( aCadena, {"IDMAEDPCE", cidmaedpce } )
                           if PasoPag->timodp == "N"
                              AAdd( aCadena, {"VAASDP", PasoDeu->Abono  } )
                           else
                              AAdd( aCadena, {"VAASDP", PasoDeu->Abonod } )
                           endif

                           If lAsigFech
                             AAdd( aCadena, {"FEASDP", xElDia } )
                           Else
                             AAdd( aCadena, {"FEASDP", PasoPag->feemdp } )
                           Endif

                           AAdd( aCadena, {"IDRST",      PasoDeu->idarchivo } )
                           AAdd( aCadena, {"TIDOPA",     PasoDeu->tido } )
                           AAdd( aCadena, {"ARCHIRST",   PasoDeu->archivo } )
                           AAdd( aCadena, {"TCASIG",     pasodeu->tcasig } )
                           AAdd( aCadena, {"REFERENCIA", MaxReferencia } )
                           AAdd( aCadena, {"KOFUASDP",   Tabpri[cusua] } )
                           AAdd( aCadena, {"SUASDP",     Tabpri[sucursal] })
                           AAdd( aCadena, {"CJASDP",     Tabpri[caja]     })
                           AADD( aCadena, {"HORAGRAB",   lahoragrab       })
                           AADD( aCadena, {"LAHORA",     xElDia           })

                           If !EjecuteSQL( "INSERT INTO MAEDPCD " +CampoValor( "ing", aCadena ),,.f.,@cElError  )
                              BREAK
                           EndIf
                        ENDIF

                     ELSEIF PasoDeu->archivo == "MAEDPCE "

                        If PasoDeu->linea == PasoPag->linea .and. PasoDeu->abono > 0
                           TMaeDpCe := {}
                           If !SeekSQL( "MAEDPCE",TMaeDpCe,{"EMPRESA","IDMAEDPCE"},{PasoDeu->empresa,PasoDeu->idarchivo},"IDMAEDPCE,ESPGDP,ENDP,TIDP,NUDP,TIMODP" )
                              cElError := OemToAnsi( "No se encontr¢ documento en MAEDPCE ")
                              BREAK
                           endif

                           **cidpce2:= retornaid("MAEDPCE",,pasodeu->tido,pasodeu->nudo,pasodeu->endo)
                           cidpce2:= Vcc(TmaeDpCe,"idmaedpce")
                           if cidpce2 == 0
                              cElError := OemToAnsi( "No se encontr¢ documento en MAEDPCE ")
                              BREAK
                           endif

                           * descontar los protestos   jgv 16/09/2009
                           If PasoDeu->Tido == "chv"
                              TMaeEdo := {}
                              SeekSQL( "CDOCCOE",TMaeEdo,{"IDDOCCOE"},{Pasodeu->idarchivo} )
                              If Vcc(TMaeEdo,"ESPGDO")=="C"
                                 If !EjecuteSQL( "UPDATE MAEEN SET PROTEVIGE=COALESCE(PROTEVIGE,0)-1 WHERE KOEN='"+PasoDeu->Endo+"' ",,.f.,@cElError )
                                    BREAK
                                 EndIf
                              EndIf
                           EndIf

                           //--- disminuye la cantidad de protestods para la entidad si el documento estaba protestado
                           If Vcc(TmaeDpCe,"EsPgDp") == "R"
                              If !EjecuteSQL( "UPDATE MAEEN SET PROTEVIGE=PROTEVIGE-1 "+;
                                              " WHERE KOEN='"+Vcc(TmaeDpCe,"Endp")+"' "+;
                                                " AND EXISTS ( SELECT P.* FROM MAEDPCE AS P WITH ( NOLOCK ) "+;
                                                               " WHERE P.IDMAEDPCE="+ str(cidpce2)+;
                                                                 " AND P.ESPGDP='R' "+;
                                                                 " AND P.VADP-COALESCE(P.VAABDP,0.0)-"+AllTrim(Str(PasoDeu->abono))+" <= "+xCero+" )",,.f.,@cElError  )
                                 BREAK
                              EndIf
                           EndIf

                           cadena := ""
                           if Vcc( TmaeDpCe,"timodp" ) == "N"
                              cadena := "VAABDP=ROUND( COALESCE(VAABDP,0.0)+"+AllTrim(Str(PasoDeu->abono))+","+AllTrim(Str(DEF_REDON))+"),"
                              cadena += "ESPGDP=CASE "+;
                                              " WHEN ROUND( VADP-COALESCE(VAABDP,0.0)-"+AllTrim(Str(PasoDeu->abono))+","+AllTrim(Str(DEF_REDON))+") <= "+xCero+" THEN 'C' "+;
                                              " ELSE ESPGDP "+;
                                             " END "
                           else
                              cadena := "VAABDP=ROUND( COALESCE(VAABDP,0.0)+"+AllTrim(Str(PasoDeu->abonod))+",2),"
                              cadena += "ESPGDP=CASE "+;
                                              " WHEN ROUND( VADP-COALESCE(VAABDP,0.0)-"+AllTrim(Str(PasoDeu->abonod))+",2) <= "+xCero+" THEN 'C' "+;
                                              " ELSE ESPGDP "+;
                                             " END "
                           endif

                           If !EjecuteSQL( "UPDATE MAEDPCE SET "+cadena+" WHERE IDMAEDPCE="+nacsb(cidpce2),,.f.,@cElError  )
                              BREAK
                           EndIf
                           PasoPag->IdMaeDpCe := cidmaedpce

                           //aqui poner pago cuotas pagare
                           aCadena := {}
                           AAdd( aCadena, {"IDMAEDPCE", cidmaedpce  } )
                           if PasoPag->timodp == "N"
                              AAdd( aCadena, {"VAASDP", PasoDeu->Abono  } )
                           else
                              AAdd( aCadena, {"VAASDP", PasoDeu->Abonod } )
                           endif

                           If lAsigFech
                             AAdd( aCadena, {"FEASDP", xElDia } )
                           Else
                             AAdd( aCadena, {"FEASDP", PasoPag->feemdp } )
                           Endif

                           AAdd( aCadena, {"IDRST",      PasoDeu->idarchivo } )
                           AAdd( aCadena, {"TIDOPA",     PasoDeu->tido } )
                           AAdd( aCadena, {"ARCHIRST",   PasoDeu->archivo } )
                           AAdd( aCadena, {"TCASIG",     pasodeu->tcasig } )
                           AAdd( aCadena, {"REFERENCIA", MaxReferencia } )
                           AAdd( aCadena, {"KOFUASDP",   Tabpri[cusua] } )
                           AAdd( aCadena, {"SUASDP",     Tabpri[sucursal] })
                           AAdd( aCadena, {"CJASDP",     Tabpri[caja]     })
                           AADD( aCadena, {"HORAGRAB",   lahoragrab       })
                           AADD( aCadena, {"LAHORA",     xElDia           })

                           If !EjecuteSQL( "INSERT INTO MAEDPCD " +CampoValor( "ing", aCadena ),,.f.,@cElError  )
                              BREAK
                           EndIf

                        ENDIF
                     ELSE
                        cElError := "PASODEU NO ESPECIFICA ARCHIVO A  ACTUALIZAR "
                        BREAK
                     ENDIF
                     PasoDeu->(dbskip())
                  ENDDO
               ENDIF
               AADD(Tlosdpce,Pasopag->idmaedpce)
               ** 1.1 TRATAMIENTO TARJETAS DE CREDITO EN CUOTAS MTS (PARA TODDOS)
               IF Pasopag->tidp == "TJV" .AND. Pasopag->cuotas > 1 .AND. PASOPAG->NUEVOP
                  Abrepagoencuotas(OPADRE,TABPRI,Pasopag->idmaedpce,Lahoragrab,@cElError )
               ENDIF
               PasoPag->(dbskip())
            ENDDO
      CASE nudeudas == 1
           ? "caso del numero de deuda    igual 1 "

    ENDCASE

    If !EjecuteSQL( "COMMIT TRANSACTION",,.f.,@cElError ) ; BREAK ; EndIf

RECOVER USING objLocal

   If EjecuteSQL( "ROLLBACK TRANSACTION",,.f.,@cElError )

      If !Empty( cElError )
         MsgStop( cElError )
      EndIf
      ? "Ocurrio un error al intentar grabar pago (1796)"+CRLF+;
        ErrorMessage( objLocal ), cElError
   Else
      ? "ERROR.x AL INTENTAR DESHACER LA TRANSACCION DE PAGOS"+CRLF+;
        "ROLLBACK 1791"+CRLF+;
        ErrorMessage( objLocal ), cElError
   EndIf
END
ERRORBLOCK( oErrorActual )
oPadre:Enable()

If nocuadven
   MsgStop( cAvisos )
EndIf

RETURN xtdpaim
//----------------------------------------------------------------------------------------
static Function PideRefAntr3c( cuantosdoc, PASOPAG, oPadre, tabpri )
Local oDlg, oBtnVolver, oBtnGrabar, oReferencia,odocrelant,obtnasigdoc
Local oLbx, oGrupo, oTexto, oBtnAyuda
LOCAL lugar,aux, tecla, oTrans
Local cCanRedon,ccanredon2,aanticipo
Local xEd := 0
local dev:= .t.
MEMVAR DEF_REDON
If DEF_REDON == 0
   cCanRedon := "99999,999,999"
Else
   cCanRedon := "9999999,999.99"
EndIf
cCanRedon2:= "9999999,999.99"
oPadre:Disable()

lugar:= PasoPag->(recno())
PasoPag->(dbgotop())
WHILE PasoPag->(!eof())
   IF PASOPAG->TIDP = "TJV" .AND. pasopag->cuotas > 1 .and. pasopag->vaasdp <> pasopag->vadp
       msginfo("Si la tarjeta de crédito indica pago en cuotas, entonces debe distribuirse como pago completamente ","ATENCION")
       dev:= .f.
       exit
   endif

   If ( ( PasoPag->timodp == "N" .and. Round( PasoPag->vadp-PasoPag->vaasdp,DEF_REDON) <> Round(0,DEF_REDON) ) .or.;
        ( PasoPag->timodp <> "N" .and. Round( PasoPag->vadpd-PasoPag->vaasdpd-PasoPag->vavudpd,2) <> Round(0,2) ) ) .and.;
      PasoPag->nuevop .and. ;
      PasoPag->tidp <> "ncv" .and. PasoPag->tidp <> "ncc" .and. PasoPag->tidp <> "nev"

      If cuantosdoc <> 1 .or. PasoPag->vavudp == 0
         Recurso( "Gestion.dll" )
         DEFINE DIALOG oDlg RESNAME "Referencia" OF oPadre

         REDEFINE GET oReferencia VAR PasoPag->refanti   ID 103 of oDlg
         REDEFINE SAY odocrelant  VAR PasoPag->docrelant ID 104 of oDlg

         If PasoPag->timodp == "E"
            aAnticipo := Array(1,8)
            aAnticipo[1,1] := PasoPag->tidp
            aAnticipo[1,2] := PasoPag->nucudp
            aAnticipo[1,3] := PasoPag->modp
            aAnticipo[1,4] := PasoPag->vadpd
            aAnticipo[1,5] := ( PasoPag->vadpd-PasoPag->vaasdpd-PasoPag->vavudpd)
            aAnticipo[1,6] := PasoPag->vavudpd
            aAnticipo[1,7] := PasoPag->vavudp
            aAnticipo[1,8] := ( PasoPag->vadpd-PasoPag->vaasdpd-PasoPag->vavudpd)

            oLbx := TbRam():ReDefine( 151,;
                           {|| { aAnticipo[1,1], aAnticipo[1,2], aAnticipo[1,3],;
                                 Tran( aAnticipo[1,4], cCanRedon2), Tran( aAnticipo[1,5], cCanRedon2),;
                                 Tran( aAnticipo[1,6], cCanRedon2), Tran( aAnticipo[1,7], cCanRedon2),;
                                 Tran( aAnticipo[1,8], cCanRedon2), " " } },;
                           oDlg,;
                           {"TDP", "Numero", "Mon","Valor","Saldo","Vuelto US$","Vuelto Nac","Como Anticipo"," "},;
                           {30,65,25,75,75,75,75,75,1},,,,,,,,,,,, .F.,,,,, )

            oLbx:SetArray( aAnticipo )
            oLbx:aJustify   := {.f.,.f.,.f.,.t.,.t.,.t.,.t.,.t.,.f.}
            oLbx:nColAct    := 6
            oLbx:bKeyDown   := {|| VueltoAndo(oLbx,oDlg,aAnticipo)}
            ** onena siempre lo toma como vuelto   jgv 26/01/2006
            If AllTrim(tabpri[rs_rut]) $ "_DAN840621-MZ7_JDI000407-T97_SAL030905-9B2_"
               oLbx:nColAct := 6
            EndIf
         Else
            aAnticipo := Array(1,6)
            aAnticipo[1,1] := PasoPag->tidp
            aAnticipo[1,2] := PasoPag->nucudp
            aAnticipo[1,3] := PasoPag->vadp
            aAnticipo[1,4] := ( PasoPag->vadp-PasoPag->vaasdp-PasoPag->vavudp)
            aAnticipo[1,5] := PasoPag->vavudp
            aAnticipo[1,6] := ( PasoPag->vadp-PasoPag->vaasdp-PasoPag->vavudp)

            oLbx := TbRam():ReDefine( 151,;
                           {|| { aAnticipo[1,1],;
                                 aAnticipo[1,2],;
                                 Tran( aAnticipo[1,3], cCanRedon ),;
                                 Tran( aAnticipo[1,4], cCanRedon ),;
                                 Tran( aAnticipo[1,5], cCanRedon ),;  // pos=5, como vuelto
                                 Tran( aAnticipo[1,6], cCanRedon ),;  // pos=6, como anticipo
                                 " " } },;
                           oDlg,;
                           {"TDP", "Numero", "Valor","Saldo","Como Vuelto","Como Anticipo"," "},;
                           {30,65,75,75,75,75,1},,,,,,,,,,,, .F.,,,,, )

            oLbx:SetArray( aAnticipo )
            oLbx:aJustify   := {.f.,.f.,.t.,.t.,.t.,.t.,.f.}
            oLbx:nColAct    := 5
            oLbx:bKeyDown   := {|| VueltoAnticipo(TabPri,oLbx,oDlg,aAnticipo),oReferencia:SetFocus()}

            ** onena siempre lo toma como vuelto   jgv 26/01/2006
            If AllTrim(tabpri[rs_rut]) $ "_DAN840621-MZ7_JDI000407-T97_SAL030905-9B2_"
               oLbx:nColAct := 5
            EndIf
         EndIf
         oLbx:lMChange   := .F.
         oLbx:oHScroll   := NIL
         oLbx:lCellStyle := .T.
         oLbx:bGotFocus  := {|| TomaFoco(oLbx) }
         oLbx:bLostFocus := {|| DejaFoco(oLbx) }

         REDEFINE BUTTON oBtnasigdoc ID 507 Of Odlg ACTION (asignadocanti(odlg,tabpri),odocrelant:refresh())
         oBtnasigdoc:cToolTip := "Indicar documento compromiso relacionado si el pago se recibe como anticipo "

         REDEFINE BUTTON oBtnVolver  ID 150 Of Odlg ACTION (IIF(MSGYESNO("Confirma detener grabación"),(dev:= .f., oDlg:End()),odlg:end()))
         oBtnvolver:cToolTip := "Volver a pantalla anterior e interrumpir proceso "

         REDEFINE BUTTON oBtnGrabar  ID 180 Of Odlg ACTION oDlg:End()
         oBtngrabar:cToolTip := "Continuar proceso de pre_grabación "

         ACTIVATE DIALOG oDlg CENTER ON INIT oreferencia:setfocus()
      EndIf
   EndIf
   PasoPag->(dbskip())
EndDo
SysRefresh() ; oPadre:Enable()
PasoPag->(dbgoto(lugar))

RETURN dev
****************************************************************************************************
static function asignadocanti(odlg,tabpri)
local hstmt,lhaydatos,tmaes
LOCAl TABLA   := {}
LOCAl TABIDEDO:= {}
local opcion:= 0
If tabpri[sistema] == "ventas"
   hstmt:= 0 ; lhaydatos:= .f. ; tmaes:={}
   hStmt := CrearCursor( TMaes,"SELECT IDMAEEDO,TIDO,NUDO,ENDO,FEEMDO,TIMODO,MODO,VABRDO,VAABDO "+;
                               " FROM MAEEDO WITH ( NOLOCK ) "+;
                               " WHERE EMPRESA='"+TabPri[laempresa]+"' "+;
                               " AND ENDO='"+PasoEn->koen+"' "+;
                               " AND TIDO IN ('NVV','RES','PRO') AND ESDO <> 'C' AND   "+;
                               "NOT EXISTS (SELECT * FROM MAEDPCE WHERE MAEDPCE.ARCHIRSD = 'MAEEDO' AND MAEDPCE.IDRSD = MAEEDO.IDMAEEDO) ", @lHayDatos )
ELSE
   hstmt:= 0 ; lhaydatos:= .f. ; tmaes:={}
   hStmt := CrearCursor( TMaes,"SELECT IDMAEEDO,TIDO,NUDO,ENDO,FEEMDO,TIMODO,MODO,VABRDO,VAABDO "+;
                               " FROM MAEEDO WITH ( NOLOCK ) "+;
                               " WHERE EMPRESA='"+TabPri[laempresa]+"' "+;
                               " AND ENDO='"+PasoEn->koen+"' "+;
                               " AND TIDO = 'OCC' AND ESDO <> 'C' AND   "+;
                               "NOT EXISTS (SELECT * FROM MAEDPCE WHERE MAEDPCE.ARCHIRSD = 'MAEEDO' AND MAEDPCE.IDRSD = MAEEDO.IDMAEEDO) ", @lHayDatos )
ENDIF
While lHayDatos
   AAdd(tabla, Vcc( Tmaes,"tido" )+" "+;
                   Vcc( Tmaes,"nudo" )+" "+;
                   FechaChica( Vcc( Tmaes,"feemdo" ),.T. )+" "+;
                   Vcc( Tmaes,"modo" )+" "+;
                   ptocom(Vcc( Tmaes,"vabrdo" ),10,2) +" "+;
                   ptocom(Vcc( Tmaes,"vaabdo" ),10,2))
   AAdd(tabidedo,Vcc(Tmaes,"IDMAEEDO"))
   If SkipSQL( hStmt, TMaes ) == 0
      EXIT
   EndIf
EndDo
Liberacursor( hStmt )
opcion := opciones(oDlg, tabla,"TD. Número---  F.Emis.  Mo  --Valor D.P. Abonado ",,,.t.)
if opcion <> 0
   pasopag->docrelant := tabla[opcion]
   pasopag->archirsd  := "MAEEDO"
   pasopag->idrsd     := tabidedo[opcion]
endif
Return nil
//----------------------------------------------------------------------------------------
Static Function VueltoAnticipo( TabPri, oLbx, oDlg, aAnticipo )
Local xEd, xEd2
Local lOk := .F.
MEMVAR ARROBAE
If GetAsyncKey( 13 ) .and. oLbx:nColAct == 5
   If aAnticipo[1,1] == "LTV" .and. ExisteRestriccion( TabPri[cusua], "NO000500" )
      MsgStop( "No está permitido que letras de Cambio entreguen vuelto", "ATENCION" )
   Else
      xEd := PasoPag->vavudp
      If oLbx:lEditCol( oLbx:nColAct,@xEd,"@K 99999999999.999",,CLR_YELLOW,CLR_BLUE)
         If xEd >= 0 .and. xEd <= ( PasoPag->vadp-PasoPag->vaasdp)
           PasoPag->vavudp := xEd
            aAnticipo[1,5] := PasoPag->vavudp
            aAnticipo[1,6] := ( PasoPag->vadp-PasoPag->vaasdp-PasoPag->vavudp)
           oLbx:DrawSelect()
         EndIf
      EndIf
   EndIf
EndIf

Return NIL
//----------------------------------------------------------------------------------------
Static Function VueltoAndo( oLbx, oDlg, aAnticipo )
Local xEd, xEd2, lOk := .F.
If GetAsyncKey( 13 )
   If oLbx:nColAct == 6
      xEd := PasoPag->vavudpd
      If oLbx:lEditCol( oLbx:nColAct,@xEd,"@K 9999999999.9999",,CLR_YELLOW,CLR_BLUE)
         If xEd >= 0 .and. Round(xEd,2) <= Round( PasoPag->vadpd-PasoPag->vaasdpd, 2)    // yo puse el round(,2) no daba una comparacion 24.93US$   jgv 15/12.2008
            PasoPag->vavudpd := xEd
            aAnticipo[1,6] := PasoPag->vavudpd
            PasoPag->vavudp:= round( PasoPag->vavudpd*PasoPag->tamodp,0)
            aAnticipo[1,7] := PasoPag->vavudp
            aAnticipo[1,8] := ( PasoPag->vadpd-PasoPag->vaasdpd-PasoPag->vavudpd)
           oLbx:DrawSelect()
         EndIf
      EndIf
   ElseIf oLbx:nColAct == 7
      xEd := PasoPag->vavudp
      If oLbx:lEditCol( oLbx:nColAct,@xEd,"@K 9999999999.9999",,CLR_YELLOW,CLR_BLUE)
         If xEd >= 0 .and. Round(xEd,2) <= Round(PasoPag->vadp-PasoPag->vaasdp,2)
            PasoPag->vavudpd:= min(round(xEd/PasoPag->tamodp,2),( PasoPag->vadpd-PasoPag->vaasdpd))
            aAnticipo[1,6] := PasoPag->vavudpd
            PasoPag->vavudp:= round( PasoPag->vavudpd*PasoPag->tamodp,0)
            aAnticipo[1,7] := PasoPag->vavudp
            aAnticipo[1,8] := ( PasoPag->vadpd-PasoPag->vaasdpd-PasoPag->vavudpd)
           oLbx:DrawSelect()
         EndIf
      EndIf
   EndIf
EndIf

Return NIL
//------------------------------------------------------------------------------------------------------------------------------------------------
STATIC FUNCTION BuscaRUT( cRtEn )
Local aRuts := {}
Local hStmt := 0
Local lHayDatos := .F.
Local TMaeEn := {}
MEMVAR _EN_LINUX_
hStmt := CrearCursor( TMaeEn, "SELECT KOEN FROM MAEEN "+If( _EN_LINUX_,""," WITH ( NOLOCK ) ")+" WHERE RTEN='"+cRtEn+"'", @lHayDatos )
While lHayDatos
   If ASCan( aRuts, Vcc( TMAEEN,"KoEn" ) ) == 0
      AAdd(  aRuts, Vcc( TMAEEN,"KoEn" ) )
   EndIf
   If SkipSQL( hStmt, TMaeEn ) == 0
      EXIT
   EndIf
EndDo
LiberaCursor( hStmt )

Return aRuts
//--------------------------------------------------------------------------------------------------------------------------------------------
static Function ImprimePagor3c( TabPri, xEnti )
msginfo("Funcion que imprime el pago en caso web estudiar sentido y medio ")
return nil
***********************************************************************************
Static Function BuscadorLocal( oPadre, oLbx3 )
Local nLugar := PasoDeu->( RecNo() )
Local ed
Static AQUI77
ed := Spac(10)

If AQUI77 <> NIL ; Return NIL ; EndIf
AQUI77 := .T.

If MsgGetR( oPadre,;
            "Buscador...",;
            "Indique numero a buscar...",;
            @ed )
   ed := AllTrim( ed )
   PasoDeu->( dbGotop() )
   While PasoDeu->( !Eof() )
      If ed $ PasoDeu->NuDo
         nLugar := PasoDeu->( RecNo() )
         Tone( 120, 0.5 ) ; Tone( 220,0.5 )
         EXIT
      EndIf
      PasoDeu->( dbSkip() )
   EndDo
EndIf
PasoDeu->( dbGoto( nLugar ) )
oLbx3:SetFocus()
oLbx3:Refresh()
AQUI77 := NIL
Return NIL
*****************************************************************************
Static Function SelectTAsa(ODLG,TABPRI)
Local aMaeMo := {}
Local aResultado
local dev:= ""
MEMVAR ARROBAE
aMaeMo   := { "MAEMO",;
              {"MAEMO.KOMO","MAEMO.NOKOMO","MAEMO.FEMO","MAEMO.VAMO","MAEMO.VAMOCOM","MAEMO.TIMO" },;
              {"MAEMO.KOMO","MAEMO.FEMO"},;
              NIL,;
              .F.,;
              {"KOMO","NOKOMO","DtoC( FEMO )",;
              "Tran( FIELD->VAMO,   '"+ARROBAE+" 99,999.99999')",;
              "Tran( FIELD->VAMOCOM,'"+ARROBAE+" 99,999.99999')",;
               "If( FIELD->TIMO =='N', 'Nacional', 'Externa' )" },;
              {"Moneda","Nombre","Fecha", "T/C Vta.","T/C Com.","Tipo"},;
              {50, 150, 67, 85, 85, 100},;
              {.f.,.f.,.f.,.t.,.t.,.f.},;
              "Tabla de Tipo de Modena" }
 aResultado := BuscarSQL( oDlg, aMaeMo  , {"MAEMO.FEMO","MAEMO.KOMO"}, {8,3}, .T. ," KOMO= '"+ tabpri[quemonedoc]+"' ",,.F., {"Fecha (dd/mm/aaaa)","(sin uso)"},,, {.T.,.F.} )
 If !Empty( aResultado )
    dev:= aResultado[3]
 EndIf
 Return dev
//-----------------------------------------------------------------------------------------------------------
STATIC FUNCTION VALORRetarg(CTIPO)
LOCAL DEV:= 0
LOCAL RETINSC  := 0
LOCAL RETNOINSC:= 0
LOCAL TVANELI  := 0
LOCAL Tmaeddo,Hstmt,Lhaydatos,tdpcd,lugar
MEMVAR DEF_REDON
TMAEDDO:={} ; HSTMT:= 0 ; LHAYDATOS:= .F.
hStmt := CrearCursor( TMaeDdo,"SELECT MAEDDO.VANELI,TCOLEGPR.* FROM MAEDDO WITH ( NOLOCK ) "+;
                              " INNER JOIN MAEPR ON MAEPR.KOPR = MAEDDO.KOPRCT "+;
                              " INNER JOIN TCOLEGPR ON MAEPR.COLEGPR = TCOLEGPR.COLEGPR "+;
                              " WHERE MAEDDO.IDMAEEDO ="+nacsb(PASODEU->IDARCHIVO),@lHayDatos )
While lHayDatos
   TVANELI+= VCC(TMAEDDO,"VANELI")
   if ctipo == "RIV" .or. ctipo == "RIC"
      RETINSC  += ROUND(VCC(Tmaeddo,"Vaneli") * VCC(Tmaeddo,"Pretivasi") /100,DEF_REDON)
      RETNOINSC+= ROUND(VCC(Tmaeddo,"Vaneli") * VCC(Tmaeddo,"Pretivani") /100,DEF_REDON)
   elseif ctipo == "RBV" .or. ctipo == "RBC"
      RETINSC  += ROUND(VCC(Tmaeddo,"Vaneli") * VCC(Tmaeddo,"Pretibbsi") /100,DEF_REDON)
      RETNOINSC+= ROUND(VCC(Tmaeddo,"Vaneli") * VCC(Tmaeddo,"Pretibbni") /100,DEF_REDON)
   elseif ctipo == "RGV" .or. ctipo == "RGC"
      RETINSC  += ROUND(VCC(Tmaeddo,"Vaneli") * VCC(Tmaeddo,"Pretgansi") /100,DEF_REDON)
      RETNOINSC+= ROUND(VCC(Tmaeddo,"Vaneli") * VCC(Tmaeddo,"Pretganni") /100,DEF_REDON)
   else
      msginfo("Valor para tipo doc no esperado")
   endif
   If SkipSQL( hStmt, TMaeDdo ) == 0
      EXIT
   EndIf
EndDo
Liberacursor( hStmt )

TDPCD:={} ; HSTMT:= 0 ; LHAYDATOS:= .F.
hStmt := CrearCursor( TDPCD,"SELECT SUM(MAEDPCD.VAASDP) AS ASIGNADO FROM MAEDPCD WITH ( NOLOCK ) "+;
                            " INNER JOIN MAEDPCE ON MAEDPCE.IDMAEDPCE = MAEDPCD.IDMAEDPCE "+;
                            " WHERE MAEDPCD.IDRST ="+ nacsb(pasodeu->idarchivo)+ " AND MAEDPCE.TIDP = '"+ctipo+"' " +;
                            " AND MAEDPCD.ARCHIRST = 'MAEEDO' ",@lHayDatos )
While lHayDatos
   RETINSC    -= VCC(Tdpcd,"ASIGNADO")
   RETNOINSC  -= VCC(Tdpcd,"ASIGNADO")
   If SkipSQL( hStmt, TDPCD ) == 0
      EXIT
   EndIf
EndDo
Liberacursor( hStmt )
lugar := PASODEU->(RECNO())
PASODEU->(dbseek(PASODEUT->NREG))
WHILE PASODEU->(!EOF()).and. pasodeu->nreg == pasodeut->nreg
    IF PASODEU->tidp == ctipo
       RETINSC    -= pasodeu->abono
       RETNOINSC  -= pasodeu->abono
    ENDIF
    PASODEU->(DBSKIP())
ENDDO
PASODEU->(DBGOTO(Lugar))
RETURN RETNOINSC
//-----------------------------------------------------------------------------------------------------------
** ESTA RUTINA SUPONE Y REQUIERE QUE LA TARJETA NO TENGA VUELTO NI ANTICIPO CONDICION QUE DEBE VENIR VALIDADA Y QUE EL NUMERO DE CUOTAS SEA MAYOR QUE 1
static FUNCTION Abrepagoencuotasr3c(ODLG,TABPRI,Cidmaedpce,Lahoragrab,Celerror)
LOCAL CCADENA,I,J,l,X,Y
LOCAL hStmt, TMaes, lHayDatos
local ldpce:= 0
Local Ttasig,Tasig,Ncuotas,Ciddpce,Ciddpcd,Avalores,Xvaasdp,Acadena,CNUDP
LOCAL Cadcontrol:= "("
Local xElDia     := fehoraser()[1]
CCADENA:= "SELECT MAEDPCE.*,IDMAEDPCD,MAEDPCD.VAASDP AS VAASDPD,FEASDP,TIDOPA,ARCHIRST,IDRST,TCASIG,MAEDPCD.REFERENCIA AS REFE,MAEDPCD.VAASDP AS ASIGDDD "+ ;
          " FROM MAEDPCE "+;
          " LEFT JOIN MAEDPCD ON MAEDPCD.IDMAEDPCE =MAEDPCE.IDMAEDPCE "+;
          " WHERE MAEDPCE.IDMAEDPCE = " + Nacsb(Cidmaedpce)
hStmt := 0 ; TMaes := {} ; lHayDatos := .F.
hStmt := CrearCursor( Tmaes, Ccadena, @lHayDatos )
GenDbf( hStmt, TMaes, "PASOTJV", .f.,,,,,lHayDatos )
LiberaCursor( hStmt )

L:= Pasotjv->(Fcount())
FOR J:= L TO 1 STEP(-1)
    IF alltrim(Pasotjv->(fieldname(J))) == "IDMAEDPCD"
       ldpce:= j-1
       exit
    endif
next
if ldpce == 0
   celError:= "No encontro campo IDMAEDPCD "
   CIERRABORRA("PASOTJV")
   break
endif

Pasotjv->(Dbgotop())
WHILE Pasotjv->(!EOF())
    Pasotjv->asigddd:= 0
    Pasotjv->(DBSKIP())
ENDDO

If !EjecuteSQL( "DELETE MAEDPCD WHERE IDMAEDPCE="+nacsb(cidmaedpce),,.f.,@cElError  )
   CIERRABORRA("PASOTJV")
   BREAK
EndIf
If !EjecuteSQL( "DELETE MAEDPCE WHERE IDMAEDPCE="+nacsb(cidmaedpce),,.f.,@cElError  )
   CIERRABORRA("PASOTJV")
   BREAK
EndIf

Pasotjv->(Dbgotop())
ncuotas:= Pasotjv->cuotas
Cnudp:= pasotjv->nudp
Ttasig:= 0
for j:= 1 to ncuotas
    Tasig:= 0
    Pasotjv->(Dbgotop())
    Lahoragrab++
    Pasotjv->horagrab:=lahoragrab
    Pasotjv->cuotas := J
    aValores := {}
    For i := 2 To Ldpce
        AAdd( aValores, { UPPER(PasoTJV->(FieldName(i))), PasoTJV->(FieldGet(i)) } )
    Next
    If !EjecuteSQL( "INSERT INTO MAEDPCE "+CampoValor( "ing", Avalores ) )
       CIERRABORRA("PASOTJV")
       BREAK
    EndIf
    ciddpce:= Ultimoid()
    IF Cadcontrol == "("
       Cadcontrol+= NACSB(Ciddpce)
    ELSE
       Cadcontrol+= ","+NACSB(Ciddpce)
    ENDIF
    ** DEJA LISTO NUDP Y FEVEDP PARA EL SIGUIENTE EN EL GOTOP DE PASOTJV
    PasoTJV->nudp:= LEFT(PasoTJV->nudp,2) + StrZero( val( right( PasoTJV->nudp,10-2) ) + 1, 10-2 )
    Pasotjv->fevedp:= pasotjv->fevedp +30

    WHILE Pasotjv->(!EOF())
        Xvaasdp := INT(pasotjv->vaasdpd/ncuotas)
        IIF(J = Ncuotas, Xvaasdp := Pasotjv->vaasdPD - PASOTJV->ASIGDDD,Pasotjv->asiGddd+= Xvaasdp)
        tasig+= Xvaasdp
        aCadena := {}
        AAdd( aCadena, {"IDMAEDPCE",ciddpce  } )
        AAdd( aCadena, {"VAASDP",    xvaasdp  } )
        AAdd( aCadena, {"FEASDP",    Pasotjv->feasdp } )
        AAdd( aCadena, {"IDRST",     pasotjv->idrst } )
        AAdd( aCadena, {"TIDOPA",    pasotjv->tidopa } )
        AAdd( aCadena, {"ARCHIRST",  Pasotjv->archirst } )
        AAdd( aCadena, {"TCASIG",    pasotjv->tcasig } )
        AAdd( aCadena, {"REFERENCIA",Pasotjv->refe } )
        AAdd( aCadena, {"KOFUASDP",  Tabpri[cusua]    })
        AAdd( aCadena, {"SUASDP",    Tabpri[sucursal] })
        AAdd( aCadena, {"CJASDP",    Tabpri[caja]     })
        AADD( aCadena, {"HORAGRAB",  lahoragrab       })
        AADD( aCadena, {"LAHORA",    xElDia           })

        If !EjecuteSQL( "INSERT INTO MAEDPCD " +CampoValor( "ing", aCadena ),,.f.,@cElError  )
           CIERRABORRA("PASOTJV")
           BREAK
        EndIf
        Pasotjv->(DBSKIP())
    ENDDO
    Ttasig+= Tasig
    If !EjecuteSQL( "UPDATE MAEDPCE SET VADP = "+nacsb(tasig) +",VAASDP = "+nacsb(tasig)+ " WHERE IDMAEDPCE="+nacsb(ciddpce),,.f.,@cElError  )
       CIERRABORRA("PASOTJV")
       BREAK
    EndIf
NEXT
cadcontrol+= ")"

Pasotjv->(Dbgotop())
**CONTROL
X:= 0 ; Y:= 0
Ccadena:= "SELECT SUM(VADP) AS TVADP FROM MAEDPCE WHERE  MAEDPCE.IDMAEDPCE IN "+ Cadcontrol
hStmt := 0 ; TMaes := {} ; lHayDatos := .F.
hStmt := CrearCursor( Tmaes, Ccadena, @lHayDatos )
IF Lhaydatos
   X:= VCC(TMAES,"TVADP")
ENDIF
LiberaCursor( hStmt )

Ccadena:= "SELECT SUM(MAEDPCD.VAASDP) AS TVADD FROM MAEDPCD  WHERE  MAEDPCD.IDMAEDPCE IN "+ Cadcontrol
hStmt := 0 ; TMaes := {} ; lHayDatos := .F.
hStmt := CrearCursor( Tmaes, Ccadena, @lHayDatos )
IF Lhaydatos
   Y:= VCC(TMAES,"TVADD")
ENDIF
LiberaCursor( hStmt )

IF X <> Y .OR. X <> PASOTJV->VADP
   CELERROR:= "NO CUADRO DESCOMPOSICION EN CUOTAS TARJETA DE CREDITO "
   CIERRABORRA("PASOTJV")
   break
ELSE
   CIERRABORRA("PASOTJV")
ENDIF
RETURN NIL
//-----------------------------------------------------------------------------------------------------------------------
