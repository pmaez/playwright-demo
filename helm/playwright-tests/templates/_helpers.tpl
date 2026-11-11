{{- define "playwright-tests.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "playwright-tests.fullname" -}}
{{- if contains .Chart.Name .Release.Name }}
{{- .Release.Name | trunc 50 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 50 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{- define "playwright-tests.selectorLabels" -}}
app.kubernetes.io/name: {{ include "playwright-tests.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "playwright-tests.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{ include "playwright-tests.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "playwright-tests.pvcName" -}}
{{- printf "%s-results" (include "playwright-tests.fullname" .) }}
{{- end }}

{{/* Pod template shared by the Job and the CronJob. */}}
{{- define "playwright-tests.podTemplate" -}}
metadata:
  labels:
    {{- include "playwright-tests.selectorLabels" . | nindent 4 }}
    app.kubernetes.io/component: test-run
    {{- with .Values.podLabels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  {{- with .Values.podAnnotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  restartPolicy: Never
  {{- with .Values.imagePullSecrets }}
  imagePullSecrets:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  securityContext:
    {{- toYaml .Values.podSecurityContext | nindent 4 }}
  containers:
    - name: playwright
      image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
      imagePullPolicy: {{ .Values.image.pullPolicy }}
      args:
        {{- range .Values.tests.projects }}
        - {{ printf "--project=%s" . | quote }}
        {{- end }}
        {{- with .Values.tests.grep }}
        - {{ printf "--grep=%s" . | quote }}
        {{- end }}
        {{- with .Values.tests.grepInvert }}
        - {{ printf "--grep-invert=%s" . | quote }}
        {{- end }}
        {{- with .Values.tests.workers }}
        - {{ printf "--workers=%v" . | quote }}
        {{- end }}
        {{- range .Values.tests.extraArgs }}
        - {{ . | quote }}
        {{- end }}
      env:
        - name: CI
          value: "true"
        - name: RESULTS_DIR
          value: /results
        - name: TEST_ENV
          value: {{ .Values.tests.env | quote }}
        {{- with .Values.tests.baseURL }}
        - name: BASE_URL
          value: {{ . | quote }}
        {{- end }}
        {{- with .Values.extraEnv }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
      {{- with .Values.envFrom }}
      envFrom:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      resources:
        {{- toYaml .Values.resources | nindent 8 }}
      securityContext:
        {{- toYaml .Values.securityContext | nindent 8 }}
      volumeMounts:
        - name: dshm
          mountPath: /dev/shm
        - name: results
          mountPath: /results
  volumes:
    - name: dshm
      emptyDir:
        medium: Memory
        sizeLimit: {{ .Values.shmSize }}
    - name: results
      {{- if .Values.persistence.enabled }}
      persistentVolumeClaim:
        claimName: {{ include "playwright-tests.pvcName" . }}
      {{- else }}
      emptyDir: {}
      {{- end }}
  {{- with .Values.nodeSelector }}
  nodeSelector:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.tolerations }}
  tolerations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.affinity }}
  affinity:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
