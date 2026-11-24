Unicode true
!include LogicLib.nsh
!include FileFunc.nsh
Name "UDM browser setup"
OutFile "${OUTPUT_FILE}"
RequestExecutionLevel admin
SilentInstall silent
!define EXTENSION_ID "lpkacmofednpbgfiogbkbiifknnljiob"
!define UPDATE_URL "https://clients2.google.com/service/update2/crx"
!define OWNERS "Software\UDM\BrowserSetupOwners"
!define POLICY_CHROME "Software\Policies\Google\Chrome\ExtensionInstallForcelist"
!define POLICY_EDGE "Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"
!define POLICY_BRAVE "Software\Policies\BraveSoftware\Brave\ExtensionInstallForcelist"
Var owner

!macro registerBrowser ROOT
  EnumRegValue $1 HKLM "${ROOT}\${EXTENSION_ID}" 0
  ${If} $1 == ""
    ClearErrors
    WriteRegStr HKLM "${ROOT}\${EXTENSION_ID}" "update_url" "${UPDATE_URL}"
    ${If} ${Errors}
      SetErrorLevel 1
      Quit
    ${EndIf}
    WriteRegDWORD HKLM "${ROOT}\${EXTENSION_ID}" "UDMOwned" 1
  ${EndIf}
!macroend

!macro unregisterBrowser ROOT
  ReadRegDWORD $1 HKLM "${ROOT}\${EXTENSION_ID}" "UDMOwned"
  ReadRegStr $2 HKLM "${ROOT}\${EXTENSION_ID}" "update_url"
  ${If} $1 == 1
  ${AndIf} $2 == "${UPDATE_URL}"
    DeleteRegValue HKLM "${ROOT}\${EXTENSION_ID}" "update_url"
    DeleteRegValue HKLM "${ROOT}\${EXTENSION_ID}" "UDMOwned"
    DeleteRegKey /ifempty HKLM "${ROOT}\${EXTENSION_ID}"
  ${EndIf}
!macroend

; Forcelist policies make Chrome, Edge and Brave install the store extension without an
; Enable prompt. Policy keys live in the 64-bit registry view, so switch to it first.
!macro forcelistAdd KEY
  SetRegView 64
  ClearErrors
  WriteRegStr HKLM "${KEY}" "UDM" "${EXTENSION_ID};${UPDATE_URL}"
  ${If} ${Errors}
    SetErrorLevel 1
    Quit
  ${EndIf}
!macroend

!macro forcelistRemove KEY
  SetRegView 64
  DeleteRegValue HKLM "${KEY}" "UDM"
!macroend

Section
  SetRegView 32
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/owner=" $owner
  ${If} ${Errors}
  ${OrIf} $owner == ""
    SetErrorLevel 2
    Quit
  ${EndIf}
  ClearErrors
  ${GetOptions} $0 "/remove" $3
  ${IfNot} ${Errors}
    DeleteRegValue HKLM "${OWNERS}" "$owner"
    EnumRegValue $1 HKLM "${OWNERS}" 0
    ${If} $1 == ""
      !insertmacro unregisterBrowser "Software\Google\Chrome\Extensions"
      !insertmacro unregisterBrowser "Software\Microsoft\Edge\Extensions"
      !insertmacro forcelistRemove "${POLICY_CHROME}"
      !insertmacro forcelistRemove "${POLICY_EDGE}"
      !insertmacro forcelistRemove "${POLICY_BRAVE}"
      DeleteRegKey /ifempty HKLM "${OWNERS}"
    ${EndIf}
  ${Else}
    ClearErrors
    WriteRegDWORD HKLM "${OWNERS}" "$owner" 1
    ${If} ${Errors}
      SetErrorLevel 1
      Quit
    ${EndIf}
    !insertmacro registerBrowser "Software\Google\Chrome\Extensions"
    !insertmacro registerBrowser "Software\Microsoft\Edge\Extensions"
    !insertmacro forcelistAdd "${POLICY_CHROME}"
    !insertmacro forcelistAdd "${POLICY_EDGE}"
    !insertmacro forcelistAdd "${POLICY_BRAVE}"
  ${EndIf}
  SetErrorLevel 0
SectionEnd
